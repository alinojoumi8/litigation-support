-- ReadyFile (working name): core schema.
-- STATUS: UNTESTED. Written to match src/lib/data/supabase.ts but not yet run
-- against a Supabase project (none exists yet). Run with `supabase db push`
-- on a fresh project in the Canada (Central) region and fix anything it
-- reports before relying on it.
--
-- Conventions:
-- * App-generated ids are opaque text ("case_...", "doc_..."). User ids are
--   Supabase Auth uuids.
-- * Every case table has case_id and a composite primary key (case_id, id),
--   and cascades on case deletion, so deleting a case deletes everything
--   derived from it.
-- * jsonb columns keep the application's camelCase keys inside.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text not null default '',
  created_at timestamptz not null default now(),
  is_demo boolean not null default false,
  accepted_terms_at timestamptz not null default now()
);

create table public.cases (
  id text primary key,
  owner_id uuid not null references auth.users (id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 80),
  kind text not null check (kind in ('civil_small_claims', 'civil_superior', 'civil_other', 'criminal')),
  audience text not null check (audience in ('with_lawyer', 'self_rep')),
  court text not null default '',
  stage text not null default '',
  role text not null default 'other' check (role in ('plaintiff', 'defendant', 'applicant', 'respondent', 'accused', 'other')),
  court_file_number text not null default '',
  summary text not null default '',
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  criminal_ack_at timestamptz,
  plan_paused boolean not null default false,
  no_deadlines_yet boolean not null default false,
  pathway_step text,
  brief_exported_at timestamptz,
  money_flag_status jsonb not null default '{}'::jsonb,
  expert_drafts jsonb not null default '{}'::jsonb
);

create table public.case_members (
  id text primary key,
  case_id text not null references public.cases (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  unique (case_id, user_id)
);
create index case_members_user_idx on public.case_members (user_id);

create table public.documents (
  id text not null,
  case_id text not null references public.cases (id) on delete cascade,
  seq integer not null,
  title text not null,
  filename text not null,
  mime_type text not null,
  size bigint not null check (size >= 0),
  sha256 text not null,
  origin text not null check (origin in ('mine', 'other_side', 'crown_disclosure', 'my_lawyer', 'filed_court', 'public')),
  provided_by text not null default '',
  how_obtained text not null default '',
  original_available boolean not null default false,
  doc_date date,
  doc_type text not null default 'Document',
  tags text[] not null default '{}',
  page_count integer not null default 0,
  extraction text not null,
  email_meta jsonb,
  uploaded_at timestamptz not null default now(),
  uploaded_by uuid references auth.users (id) on delete set null,
  is_sample boolean not null default false,
  primary key (case_id, id),
  unique (case_id, seq),
  unique (id)
);

create table public.document_pages (
  id text not null,
  case_id text not null references public.cases (id) on delete cascade,
  doc_id text not null references public.documents (id) on delete cascade,
  page integer not null check (page >= 1),
  text text not null default '',
  primary key (case_id, id)
);
create index document_pages_doc_idx on public.document_pages (doc_id, page);
-- Full-text search over a case (search UI not built yet).
create index document_pages_fts_idx on public.document_pages using gin (to_tsvector('english', text));

create table public.document_summaries (
  id text not null,
  case_id text not null references public.cases (id) on delete cascade,
  doc_id text not null references public.documents (id) on delete cascade,
  summary text not null,
  key_facts jsonb not null default '[]'::jsonb,
  people text[] not null default '{}',
  provider text not null,
  model text not null,
  prompt_version text not null,
  guard_notes text[] not null default '{}',
  created_at timestamptz not null default now(),
  primary key (case_id, id)
);

create table public.timeline_events (
  id text not null,
  case_id text not null references public.cases (id) on delete cascade,
  date date not null,
  date_precision text not null check (date_precision in ('day', 'month', 'year')),
  description text not null,
  source_doc_id text references public.documents (id) on delete cascade,
  source_page integer,
  quote text,
  people text[] not null default '{}',
  tags text[] not null default '{}',
  status text not null check (status in ('unconfirmed', 'confirmed')),
  created_by text not null check (created_by in ('ai', 'user')),
  provider text,
  model text,
  prompt_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (case_id, id)
);
create index timeline_events_date_idx on public.timeline_events (case_id, date);

create table public.flags (
  id text not null,
  case_id text not null references public.cases (id) on delete cascade,
  fingerprint text not null,
  kind text not null check (kind in ('date_conflict', 'amount_mismatch', 'name_variation', 'missing_attachment', 'version_difference', 'statement_conflict')),
  title text not null,
  detail text not null,
  sources jsonb not null default '[]'::jsonb,
  status text not null check (status in ('new', 'matters', 'not_an_issue', 'ask_lawyer')),
  created_by text not null check (created_by in ('rules', 'ai')),
  provider text,
  model text,
  user_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (case_id, id),
  unique (case_id, fingerprint)
);
create index flags_sources_idx on public.flags using gin (sources jsonb_path_ops);

create table public.signature_comparisons (
  id text not null,
  case_id text not null references public.cases (id) on delete cascade,
  title text not null,
  questioned_doc_id text not null,
  known_doc_ids text[] not null default '{}',
  observations jsonb not null default '[]'::jsonb,
  examiner_note text not null default '',
  flagged_for_examiner boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (case_id, id)
);

create table public.transactions (
  id text not null,
  case_id text not null references public.cases (id) on delete cascade,
  import_id text not null,
  import_name text not null,
  "row" integer not null,
  date date not null,
  description text not null default '',
  amount_cents bigint not null,
  balance_cents bigint,
  account text not null default '',
  primary key (case_id, id)
);

create table public.deadlines (
  id text not null,
  case_id text not null references public.cases (id) on delete cascade,
  title text not null,
  date date not null,
  source_doc_id text references public.documents (id) on delete set null,
  notes text not null default '',
  done boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (case_id, id)
);

create table public.questions (
  id text not null,
  case_id text not null references public.cases (id) on delete cascade,
  text text not null,
  audience text not null check (audience in ('lawyer', 'expert', 'self')),
  status text not null check (status in ('open', 'answered')),
  answer text not null default '',
  created_at timestamptz not null default now(),
  primary key (case_id, id)
);

create table public.task_completions (
  id text not null,
  case_id text not null references public.cases (id) on delete cascade,
  week_key text not null,
  task_key text not null,
  done_at timestamptz not null default now(),
  primary key (case_id, id)
);

create table public.pathway_progress (
  id text not null,
  case_id text not null references public.cases (id) on delete cascade,
  pathway_id text not null,
  checked text[] not null default '{}',
  current_step text,
  updated_at timestamptz not null default now(),
  primary key (case_id, id)
);

create table public.exports (
  id text not null,
  case_id text not null references public.cases (id) on delete cascade,
  kind text not null check (kind in ('brief', 'expert_examiner', 'expert_accountant', 'zip', 'timeline_csv', 'ics')),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  primary key (case_id, id)
);

-- Audit log: ids and action names only, never content. Append-only.
-- case_id has no foreign key on purpose, so "case.deleted" entries survive.
create table public.audit_log (
  id text primary key,
  at timestamptz not null default now(),
  user_id uuid,
  case_id text,
  action text not null check (action ~ '^[a-z_.]{3,60}$'),
  target_type text,
  target_id text
);
create index audit_log_case_idx on public.audit_log (case_id, at desc);
create index audit_log_user_idx on public.audit_log (user_id, at desc);

create table public.contact_messages (
  id text primary key,
  at timestamptz not null default now(),
  name text not null check (char_length(name) <= 100),
  email text not null check (char_length(email) <= 200),
  topic text not null,
  message text not null check (char_length(message) <= 2000)
);
