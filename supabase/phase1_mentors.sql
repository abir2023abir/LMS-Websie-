-- Mentor levels, course settings, and the student records a guardian reads.
-- Run once in the Supabase SQL Editor, after phase1_accounts.sql.

alter table public.profiles
  add column if not exists mentor_level text not null default 'lead'
  check (mentor_level in ('lead', 'assistant'));

create table if not exists public.course_settings (
  course_id text primary key,
  visibility text not null default 'published' check (visibility in ('published', 'hidden', 'archived')),
  approval text not null default 'none' check (approval in ('none', 'pending', 'approved')),
  discount integer not null default 0 check (discount between 0 and 90),
  mentor_email text not null default '',
  mentor_history jsonb not null default '[]',
  updated_by text,
  updated_at timestamptz not null default now()
);

create table if not exists public.student_progress (
  student_id text not null references public.profiles(id) on delete cascade,
  course_id text not null,
  percent integer not null default 0,
  completed_lessons integer not null default 0,
  total_lessons integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (student_id, course_id)
);

create table if not exists public.student_results (
  id text primary key,
  student_id text not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('exam', 'quiz')),
  label text not null default '',
  score numeric not null default 0,
  total numeric not null default 0,
  passed boolean not null default false,
  review text not null default '',
  graded_by text,
  at timestamptz not null default now()
);

create table if not exists public.calendar_events (
  id text primary key,
  title text not null,
  kind text not null check (kind in ('class', 'exam', 'meeting', 'deadline')),
  date date not null,
  meet text not null default '',
  created_by text,
  created_at timestamptz not null default now()
);

alter table public.course_settings enable row level security;
alter table public.student_progress enable row level security;
alter table public.student_results enable row level security;
alter table public.calendar_events enable row level security;
