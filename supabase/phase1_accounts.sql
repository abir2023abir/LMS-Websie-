-- Accounts, guardian links, and attendance. Run once in the Supabase SQL Editor.

create table if not exists public.profiles (
  id text primary key,
  email text not null unique,
  name text not null,
  password_hash text not null,
  roles text[] not null default '{Student}',
  active_role text not null default 'Student',
  disabled boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.guardian_links (
  id text primary key,
  guardian_id text not null references public.profiles(id) on delete cascade,
  student_email text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  decided_by text,
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  unique (guardian_id, student_email)
);

create table if not exists public.attendance (
  student_id text not null references public.profiles(id) on delete cascade,
  day date not null,
  primary key (student_id, day)
);

-- Only the server (secret key) reads and writes these tables.
alter table public.profiles enable row level security;
alter table public.guardian_links enable row level security;
alter table public.attendance enable row level security;
