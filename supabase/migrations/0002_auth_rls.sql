alter table if exists public.tasks
  add column if not exists user_id uuid references auth.users(id);

alter table if exists public.study_records
  add column if not exists user_id uuid references auth.users(id);

alter table if exists public.attachments
  add column if not exists user_id uuid references auth.users(id);

create index if not exists idx_tasks_user_id on public.tasks(user_id);
create index if not exists idx_study_records_user_id on public.study_records(user_id);
create index if not exists idx_attachments_user_id on public.attachments(user_id);

alter table if exists public.tasks enable row level security;
alter table if exists public.study_records enable row level security;
alter table if exists public.attachments enable row level security;

drop policy if exists "tasks_select_own" on public.tasks;
create policy "tasks_select_own"
  on public.tasks
  for select
  using (auth.uid() = user_id);

drop policy if exists "tasks_insert_own" on public.tasks;
create policy "tasks_insert_own"
  on public.tasks
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "tasks_update_own" on public.tasks;
create policy "tasks_update_own"
  on public.tasks
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "tasks_delete_own" on public.tasks;
create policy "tasks_delete_own"
  on public.tasks
  for delete
  using (auth.uid() = user_id);

drop policy if exists "study_records_select_own" on public.study_records;
create policy "study_records_select_own"
  on public.study_records
  for select
  using (auth.uid() = user_id);

drop policy if exists "study_records_insert_own" on public.study_records;
create policy "study_records_insert_own"
  on public.study_records
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "study_records_update_own" on public.study_records;
create policy "study_records_update_own"
  on public.study_records
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "study_records_delete_own" on public.study_records;
create policy "study_records_delete_own"
  on public.study_records
  for delete
  using (auth.uid() = user_id);

drop policy if exists "attachments_select_own" on public.attachments;
create policy "attachments_select_own"
  on public.attachments
  for select
  using (auth.uid() = user_id);

drop policy if exists "attachments_insert_own" on public.attachments;
create policy "attachments_insert_own"
  on public.attachments
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "attachments_update_own" on public.attachments;
create policy "attachments_update_own"
  on public.attachments
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "attachments_delete_own" on public.attachments;
create policy "attachments_delete_own"
  on public.attachments
  for delete
  using (auth.uid() = user_id);
