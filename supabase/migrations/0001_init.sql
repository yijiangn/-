create table if not exists public.tasks (
  id text primary key,
  title text not null,
  subject_key text not null check (subject_key in ('math', 'english', 'cs408')),
  bucket text not null check (bucket in ('today', 'long_term')),
  status text not null check (status in ('not_started', 'in_progress', 'delayed', 'completed')),
  progress integer not null default 0 check (progress between 0 and 100),
  steps jsonb not null default '[]'::jsonb,
  current_step integer not null default 0,
  focus text not null,
  note text,
  estimate_label text,
  deadline_label text,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.study_records (
  id text primary key,
  record_type text not null check (record_type in ('mistake', 'knowledge')),
  title text not null,
  subject_key text not null check (subject_key in ('math', 'english', 'cs408')),
  content_type text,
  chapter text,
  importance integer check (importance between 1 and 5),
  source text,
  summary text,
  content text not null,
  review_tip text,
  caution text,
  tags jsonb not null default '[]'::jsonb,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.attachments (
  id text primary key,
  record_id text not null references public.study_records(id) on delete cascade,
  label text not null,
  kind text not null check (kind in ('screenshot', 'photo', 'file')),
  tone text not null check (tone in ('emerald', 'sky', 'amber', 'rose', 'slate')),
  storage_path text,
  public_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_tasks_subject_key on public.tasks(subject_key);
create index if not exists idx_tasks_bucket on public.tasks(bucket);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_tasks_archived_at on public.tasks(archived_at);
create index if not exists idx_tasks_created_at on public.tasks(created_at desc);

create index if not exists idx_study_records_record_type on public.study_records(record_type);
create index if not exists idx_study_records_subject_key on public.study_records(subject_key);
create index if not exists idx_study_records_content_type on public.study_records(content_type);
create index if not exists idx_study_records_importance on public.study_records(importance);
create index if not exists idx_study_records_archived_at on public.study_records(archived_at);
create index if not exists idx_study_records_created_at on public.study_records(created_at desc);

create index if not exists idx_attachments_record_id on public.attachments(record_id);
