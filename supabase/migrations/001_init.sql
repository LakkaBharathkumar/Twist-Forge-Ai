-- TwistForge AI schema
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  premise text default '',
  genre text default 'Mystery',
  tone text default 'Suspenseful',
  twist_type text default 'Random',
  story_content jsonb not null,
  is_favorite boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists stories_user_created_idx on public.stories (user_id, created_at desc);
create index if not exists stories_user_genre_idx on public.stories (user_id, genre);
create index if not exists stories_search_idx on public.stories using gin (to_tsvector('english', title || ' ' || coalesce(premise,'')));

create table if not exists public.generation_history (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  story_id uuid references public.stories(id) on delete set null,
  action_type text not null,
  model_identifier text,
  status text default 'success',
  created_at timestamptz default now()
);
create index if not exists gen_hist_user_idx on public.generation_history (user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.stories enable row level security;
alter table public.generation_history enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own stories" on public.stories;
create policy "own stories" on public.stories for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own history" on public.generation_history;
create policy "own history" on public.generation_history for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
