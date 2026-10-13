-- TwistForge AI initial schema
-- Run in Supabase SQL editor or via Supabase CLI.

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Stories
create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  premise text not null default '',
  genre text not null default 'Mystery',
  tone text not null default 'Suspenseful',
  twist_type text not null default 'Random',
  story_content jsonb not null default '{}'::jsonb,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists stories_user_created_idx on public.stories (user_id, created_at desc);
create index if not exists stories_user_genre_idx on public.stories (user_id, genre);
create index if not exists stories_user_twist_idx on public.stories (user_id, twist_type);
create index if not exists stories_user_fav_idx on public.stories (user_id, is_favorite) where is_favorite = true;

-- Generation history (audit log)
create table if not exists public.generation_history (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  story_id uuid references public.stories(id) on delete set null,
  action_type text not null,
  model_identifier text not null default '',
  status text not null default 'success',
  created_at timestamptz not null default now()
);

create index if not exists generation_history_user_idx on public.generation_history (user_id, created_at desc);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.stories enable row level security;
alter table public.generation_history enable row level security;

drop policy if exists "profiles own read" on public.profiles;
create policy "profiles own read" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles own write" on public.profiles;
create policy "profiles own write" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "stories own all" on public.stories;
create policy "stories own all" on public.stories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "history own read" on public.generation_history;
create policy "history own read" on public.generation_history for select using (auth.uid() = user_id);
drop policy if exists "history own insert" on public.generation_history;
create policy "history own insert" on public.generation_history for insert with check (auth.uid() = user_id);
