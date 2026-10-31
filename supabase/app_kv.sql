-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Holds payment settings, payment records and course enrollments (lib/kv-store.ts).
create table if not exists public.app_kv (
  key text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Only the server (service role key) reads and writes this table.
alter table public.app_kv enable row level security;
