-- Private storage bucket for original files: path is "<case_id>/<doc_id>".
-- STATUS: UNTESTED (see 20261117000001_schema.sql).
-- Files are never public. Signed URLs are not used: the app streams files
-- through an authorized route that writes an audit entry for every read.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'case-files',
  'case-files',
  false,
  20971520, -- 20 MB, matches MAX_UPLOAD_MB default
  array['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'text/plain', 'text/csv', 'message/rfc822']
)
on conflict (id) do nothing;

create policy case_files_select on storage.objects for select to authenticated
  using (bucket_id = 'case-files' and public.is_case_member((storage.foldername(name))[1]));

create policy case_files_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'case-files' and public.is_case_member((storage.foldername(name))[1], array['owner', 'editor']));

create policy case_files_delete on storage.objects for delete to authenticated
  using (bucket_id = 'case-files' and public.is_case_member((storage.foldername(name))[1], array['owner', 'editor']));
