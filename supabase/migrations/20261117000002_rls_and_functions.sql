-- Row-level security: per-case access for every table, and the RPCs the app calls.
-- STATUS: UNTESTED (see 20261117000001_schema.sql).
--
-- Rules (mirror src/lib/auth/authz.ts):
--   owner  : read, write, upload, export, manage, delete
--   editor : read, write, upload, export
--   viewer : read
-- The app authorizes every request first; RLS is the second layer.

-- Membership check. SECURITY DEFINER so policies on case_members can use it
-- without recursion. search_path is pinned.
create or replace function public.is_case_member(p_case_id text, p_roles text[] default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.case_members m
    where m.case_id = p_case_id
      and m.user_id = auth.uid()
      and (p_roles is null or m.role = any (p_roles))
  );
$$;
revoke all on function public.is_case_member(text, text[]) from public;
grant execute on function public.is_case_member(text, text[]) to authenticated;

-- Profiles ---------------------------------------------------------------
alter table public.profiles enable row level security;
create policy profiles_self_select on public.profiles for select to authenticated using (id = auth.uid());
create policy profiles_self_insert on public.profiles for insert to authenticated with check (id = auth.uid());
create policy profiles_self_update on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, lower(new.email), coalesce(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Cases and members --------------------------------------------------------
alter table public.cases enable row level security;
create policy cases_select on public.cases for select to authenticated using (public.is_case_member(id));
create policy cases_update on public.cases for update to authenticated
  using (public.is_case_member(id, array['owner', 'editor'])) with check (public.is_case_member(id, array['owner', 'editor']));
create policy cases_delete on public.cases for delete to authenticated using (public.is_case_member(id, array['owner']));
-- Inserts go through create_case() so the owner membership is always created.

alter table public.case_members enable row level security;
create policy members_select on public.case_members for select to authenticated using (user_id = auth.uid() or public.is_case_member(case_id));
create policy members_owner_write on public.case_members for all to authenticated
  using (public.is_case_member(case_id, array['owner'])) with check (public.is_case_member(case_id, array['owner']));

-- Case-scoped tables: members read; owners and editors write.
do $$
declare t text;
begin
  foreach t in array array[
    'documents', 'document_pages', 'document_summaries', 'timeline_events', 'flags', 'signature_comparisons',
    'transactions', 'deadlines', 'questions', 'task_completions', 'pathway_progress', 'exports'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for select to authenticated using (public.is_case_member(case_id))', t || '_select', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.is_case_member(case_id, array[''owner'', ''editor'']))', t || '_insert', t);
    execute format('create policy %I on public.%I for update to authenticated using (public.is_case_member(case_id, array[''owner'', ''editor''])) with check (public.is_case_member(case_id, array[''owner'', ''editor'']))', t || '_update', t);
    execute format('create policy %I on public.%I for delete to authenticated using (public.is_case_member(case_id, array[''owner'', ''editor'']))', t || '_delete', t);
  end loop;
end $$;

-- Audit log: append-only. Users insert their own entries and read entries
-- about themselves or their cases. No update or delete policy exists.
alter table public.audit_log enable row level security;
create policy audit_insert on public.audit_log for insert to authenticated with check (user_id = auth.uid());
create policy audit_select on public.audit_log for select to authenticated
  using (user_id = auth.uid() or (case_id is not null and public.is_case_member(case_id)));

-- Contact form: anyone may insert; nobody may read through the API.
alter table public.contact_messages enable row level security;
create policy contact_insert on public.contact_messages for insert to anon, authenticated with check (true);

-- RPCs ---------------------------------------------------------------------

-- Create a case and its owner membership in one transaction. The owner is
-- always the caller, whatever the payload says.
create or replace function public.create_case(p_case jsonb, p_member_id text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_case public.cases;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  v_case := jsonb_populate_record(null::public.cases, p_case);
  v_case.owner_id := auth.uid();
  v_case.money_flag_status := coalesce(v_case.money_flag_status, '{}'::jsonb);
  v_case.expert_drafts := coalesce(v_case.expert_drafts, '{}'::jsonb);
  v_case.created_at := coalesce(v_case.created_at, now());
  v_case.updated_at := coalesce(v_case.updated_at, now());
  insert into public.cases select v_case.*;
  insert into public.case_members (id, case_id, user_id, role) values (p_member_id, v_case.id, auth.uid(), 'owner');
  return v_case.id;
end;
$$;
revoke all on function public.create_case(jsonb, text) from public;
grant execute on function public.create_case(jsonb, text) to authenticated;

-- Next stable source number (Doc 0001, 0002...) for a case.
create or replace function public.next_document_seq(p_case_id text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_case_member(p_case_id, array['owner', 'editor']) then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  perform pg_advisory_xact_lock(hashtext(p_case_id));
  return (select coalesce(max(seq), 0) + 1 from public.documents where case_id = p_case_id);
end;
$$;
revoke all on function public.next_document_seq(text) from public;
grant execute on function public.next_document_seq(text) to authenticated;

-- Delete my account: every owned case (cascades to all derived rows), my
-- memberships, my profile and my auth user. Stored files must be removed by
-- the app first (it does: src/app/actions/cases.ts deleteAccountAction).
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  insert into public.audit_log (id, user_id, action, target_type, target_id)
  values ('aud_' || replace(gen_random_uuid()::text, '-', ''), v_uid, 'account.deleted', 'user', v_uid::text);
  delete from public.cases where owner_id = v_uid;
  delete from public.case_members where user_id = v_uid;
  delete from public.profiles where id = v_uid;
  delete from auth.users where id = v_uid;
end;
$$;
revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;
