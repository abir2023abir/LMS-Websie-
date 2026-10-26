-- Landing Page CMS Schema for Career Bridge.Studio
-- Run this in Supabase: SQL Editor -> New query -> paste -> Run

-- ============================================
-- HERO CONTENT TABLE
-- ============================================
create table if not exists public.landing_hero (
  id text primary key default 'hero-1',
  headline text not null,
  description text not null,
  primary_cta_text text not null default 'Explore Courses',
  primary_cta_url text not null default '#courses',
  secondary_cta_text text not null default 'Bookkeeping',
  secondary_cta_url text not null default '#courses?category=Accounting',
  background_image_url text,
  background_video_url text,
  updated_at timestamptz not null default now()
);

-- Insert default hero content
insert into public.landing_hero (id, headline, description, primary_cta_text, primary_cta_url, secondary_cta_text, secondary_cta_url)
values (
  'hero-1',
  'Build Your Skills. Bridge the Gap to Your Future.',
  'Learn practical skills, follow structured lessons, and turn your knowledge into real-world progress. Career Bridge . Studio brings courses, assessments, and learning progress together in one place.',
  'Explore Courses',
  '#courses',
  'Bookkeeping',
  '#courses?category=Accounting'
)
on conflict (id) do nothing;

-- ============================================
-- STAT METRICS TABLE
-- ============================================
create table if not exists public.landing_stats (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  order_index integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Insert default stats
insert into public.landing_stats (title, description, order_index)
values
  ('Structured Learning Programmes', 'Follow organised courses and build a clear learning path.', 1),
  ('Practical Lessons & Activities', 'Learn by doing with hands-on exercises and real projects.', 2),
  ('Trackable Learning Progress', 'Monitor your achievements and see how far you have come.', 3),
  ('Goal-Focused Skill Development', 'Develop skills that align with your personal and career goals.', 4)
on conflict do nothing;

-- ============================================
-- SUCCESS STORIES TABLE
-- ============================================
create table if not exists public.landing_success_stories (
  id uuid primary key default gen_random_uuid(),
  headline text not null,
  description text not null,
  caption text not null,
  image_url text,
  is_verified boolean not null default false,
  is_active boolean not null default true,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Insert sample success stories (templates)
insert into public.landing_success_stories (headline, description, caption, is_verified, is_active, order_index)
values
  ('From Student to Software Developer', 'A learner''s journey of building projects, developing practical programming skills, preparing for software development opportunities.', 'From Learning MERN Stack to Building a Career | Success Story | Career Bridge.Studio', false, true, 1),
  ('From Learning to New Income Opportunities', 'A learning journey focused on developing practical skills and exploring ways to apply them to real-world work.', 'Building Practical Skills for New Opportunities | Success Story | Career Bridge .Studio', false, true, 2),
  ('Learning New Skills Beyond the Classroom', 'A learner develops technical knowledge through structured lessons, practice, and independent projects.', 'From Learning to Practical Projects | Success Story | Career Bridge.Studio', false, true, 3),
  ('Taking the First Step Toward a Global Career', 'A learner''s journey of building professional skills, improving confidence, and preparing for wider career opportunities.', 'Building Skills for International Opportunities | Success Story | Career Bridge.Studio', false, true, 4)
on conflict do nothing;

-- ============================================
-- ORIENTATION PROGRAMMES TABLE
-- ============================================
create table if not exists public.landing_orientation_programmes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  event_date timestamptz,
  event_time text,
  duration text,
  format text,
  status text not null default 'Registration Open',
  registration_url text,
  is_active boolean not null default true,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Insert default orientation programmes
insert into public.landing_orientation_programmes (title, description, status, order_index)
values
  ('Career Orientation Session', 'Explore learning pathways, identify areas for skill development, and understand the next steps toward your goals.', 'Registration Open', 1),
  ('Course Introduction & Orientation', 'Learn about available courses, their learning objectives, expected activities, and programme requirements.', 'Registration Open', 2),
  ('Skills Development Workshop', 'Discover practical learning activities and ways to apply knowledge through guided practice.', 'Registration Open', 3)
on conflict do nothing;

-- ============================================
-- WHY CHOOSE US FEATURES TABLE
-- ============================================
create table if not exists public.landing_why_choose_features (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  icon_name text not null,
  order_index integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Insert default features
insert into public.landing_why_choose_features (title, description, icon_name, order_index)
values
  ('Structured Learning Path', 'Know what to study next and follow the course structure.', 'ShieldCheck', 1),
  ('Measurable Progress', 'Review your learning activity and assessment performance.', 'Award', 2),
  ('Guided Support', 'Use available mentor, student, and programme support features.', 'Banknote', 3),
  ('Goal-Oriented Practice', 'Connect course activities with the skills you want to develop.', 'Users', 4)
on conflict do nothing;

-- ============================================
-- LEARNER REVIEWS TABLE
-- ============================================
create table if not exists public.landing_reviews (
  id uuid primary key default gen_random_uuid(),
  review_title text not null default 'A Better Learning Experience',
  reviewer_name text not null,
  reviewer_role text,
  review_text text not null,
  rating integer check (rating is null or (rating >= 1 and rating <= 5)),
  is_verified boolean not null default false,
  permission_granted boolean not null default false,
  is_active boolean not null default true,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Existing installations: require explicit learner permission before public display.
alter table public.landing_reviews
  add column if not exists review_title text not null default 'A Better Learning Experience',
  add column if not exists permission_granted boolean not null default false;
alter table public.landing_reviews alter column rating drop not null;

-- Insert sample reviews (templates)
insert into public.landing_reviews (reviewer_name, reviewer_role, review_text, rating, is_verified, is_active, order_index)
values
  ('[Verified learner name]', '[Course or programme]', '[Insert a genuine review from a verified learner.]', 5, false, true, 1),
  ('[Verified learner name]', '[Course or programme]', '[Insert a genuine review from a verified learner.]', 5, false, true, 2),
  ('[Verified learner name]', '[Course or programme]', '[Insert a genuine review from a verified learner.]', 5, false, true, 3)
on conflict do nothing;

-- ============================================
-- BLOG ARTICLES TABLE
-- ============================================
create table if not exists public.landing_blog_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null,
  summary text not null,
  content text not null,
  thumbnail_url text,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Insert sample blog articles (drafts)
insert into public.landing_blog_articles (title, slug, category, summary, content, is_published)
values
  ('Understanding AI Tools for Learning and Professional Work', 'understanding-ai-tools-learning-work', 'AI & Technology', 'Explore how AI tools can support research, learning, productivity, and professional workflows.', '<p>Explore how AI tools can support research, learning, productivity, and professional workflows.</p>', false),
  ('Digital Skills and Online Platform Updates', 'digital-skills-online-platform-updates', 'Digital Platforms', 'Learn about changes in digital tools, online platforms, and technologies that may affect how you study and work.', '<p>Learn about changes in digital tools, online platforms, and technologies that may affect how you study and work.</p>', false),
  ('From Learning to Career: How to Build Your Learning Roadmap', 'learning-career-build-learning-roadmap', 'Career Guide', 'Discover how structured learning, regular practice, and progress tracking can help you work toward your career goals.', '<p>Discover how structured learning, regular practice, and progress tracking can help you work toward your career goals.</p>', false)
on conflict (slug) do nothing;

-- ============================================
-- CONTACT ENQUIRIES TABLE
-- ============================================
create table if not exists public.landing_contact_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
alter table public.landing_hero enable row level security;
alter table public.landing_stats enable row level security;
alter table public.landing_success_stories enable row level security;
alter table public.landing_orientation_programmes enable row level security;
alter table public.landing_why_choose_features enable row level security;
alter table public.landing_reviews enable row level security;
alter table public.landing_blog_articles enable row level security;
alter table public.landing_contact_enquiries enable row level security;

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================
create index if not exists idx_landing_stats_active on public.landing_stats(is_active, order_index);
create index if not exists idx_landing_success_stories_active on public.landing_success_stories(is_active, is_verified, order_index);
create index if not exists idx_landing_orientation_active on public.landing_orientation_programmes(is_active, order_index);
create index if not exists idx_landing_why_choose_active on public.landing_why_choose_features(is_active, order_index);
create index if not exists idx_landing_reviews_active on public.landing_reviews(is_active, is_verified, order_index);
create index if not exists idx_landing_blog_published on public.landing_blog_articles(is_published, published_at desc);
create index if not exists idx_landing_contact_status on public.landing_contact_enquiries(status, created_at desc);

-- ============================================
-- CREATE FUNCTIONS FOR UPDATED_AT
-- ============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================
-- CREATE TRIGGERS FOR UPDATED_AT
-- ============================================
create trigger on_landing_hero_updated
  before update on public.landing_hero
  for each row execute procedure public.handle_updated_at();

create trigger on_landing_stats_updated
  before update on public.landing_stats
  for each row execute procedure public.handle_updated_at();

create trigger on_landing_success_stories_updated
  before update on public.landing_success_stories
  for each row execute procedure public.handle_updated_at();

create trigger on_landing_orientation_programmes_updated
  before update on public.landing_orientation_programmes
  for each row execute procedure public.handle_updated_at();

create trigger on_landing_why_choose_features_updated
  before update on public.landing_why_choose_features
  for each row execute procedure public.handle_updated_at();

create trigger on_landing_reviews_updated
  before update on public.landing_reviews
  for each row execute procedure public.handle_updated_at();

create trigger on_landing_blog_articles_updated
  before update on public.landing_blog_articles
  for each row execute procedure public.handle_updated_at();

create trigger on_landing_contact_enquiries_updated
  before update on public.landing_contact_enquiries
  for each row execute procedure public.handle_updated_at();
