create table reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  client_name text,
  period text,
  metrics jsonb,
  narrative text,
  created_at timestamptz default now()
);
alter table reports enable row level security;
create policy "own reports" on reports for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
