-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
create table if not exists public.course_edits (
  course_id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Only the server (service role key) reads and writes this table.
alter table public.course_edits enable row level security;
