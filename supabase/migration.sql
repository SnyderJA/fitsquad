-- FitSquad Database Schema
-- Run this in Supabase SQL Editor

-- Profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null,
  avatar_url text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view any profile"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Groups
create table if not exists public.groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  invite_code text unique not null default substr(md5(random()::text), 1, 8),
  created_by uuid references auth.users on delete set null,
  created_at timestamptz default now() not null
);

alter table public.groups enable row level security;

-- Group Members
create table if not exists public.group_members (
  group_id uuid references public.groups on delete cascade,
  user_id uuid references auth.users on delete cascade,
  joined_at timestamptz default now() not null,
  primary key (group_id, user_id)
);

alter table public.group_members enable row level security;

create policy "Members can view their groups"
  on public.groups for select
  using (id in (select group_id from public.group_members where user_id = auth.uid()));

create policy "Authenticated users can create groups"
  on public.groups for insert
  with check (auth.uid() = created_by);

create policy "Members can view group members"
  on public.group_members for select
  using (group_id in (select group_id from public.group_members where user_id = auth.uid()));

create policy "Authenticated users can join groups"
  on public.group_members for insert
  with check (auth.uid() = user_id);

create policy "Users can leave groups"
  on public.group_members for delete
  using (auth.uid() = user_id);

-- Allow anyone to look up a group by invite code (for joining)
create policy "Anyone can look up groups by invite code"
  on public.groups for select
  using (true);

-- Exercises library
create table if not exists public.exercises (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  type text not null check (type in ('bodyweight', 'kettlebell')),
  muscle_groups text[] not null,
  description text,
  instructions text
);

alter table public.exercises enable row level security;

create policy "Anyone can view exercises"
  on public.exercises for select using (true);

-- Workouts
create table if not exists public.workouts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date default current_date not null,
  focus_areas text[] not null,
  duration_minutes integer not null,
  exercises jsonb not null default '[]',
  completed boolean default false not null,
  created_at timestamptz default now() not null
);

alter table public.workouts enable row level security;

create policy "Users can manage own workouts"
  on public.workouts for all using (auth.uid() = user_id);

create policy "Group members can view each others workouts"
  on public.workouts for select
  using (
    user_id in (
      select gm2.user_id from public.group_members gm1
      join public.group_members gm2 on gm1.group_id = gm2.group_id
      where gm1.user_id = auth.uid()
    )
  );

-- Weigh-ins
create table if not exists public.weigh_ins (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  weight numeric(5,1) not null,
  date date default current_date not null,
  created_at timestamptz default now() not null
);

alter table public.weigh_ins enable row level security;

create policy "Users can manage own weigh-ins"
  on public.weigh_ins for all using (auth.uid() = user_id);

create policy "Group members can view each others weigh-ins"
  on public.weigh_ins for select
  using (
    user_id in (
      select gm2.user_id from public.group_members gm1
      join public.group_members gm2 on gm1.group_id = gm2.group_id
      where gm1.user_id = auth.uid()
    )
  );

-- Streaks
create table if not exists public.streaks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade unique not null,
  current_streak integer default 0 not null,
  longest_streak integer default 0 not null,
  last_workout_date date
);

alter table public.streaks enable row level security;

create policy "Users can manage own streaks"
  on public.streaks for all using (auth.uid() = user_id);

create policy "Group members can view each others streaks"
  on public.streaks for select
  using (
    user_id in (
      select gm2.user_id from public.group_members gm1
      join public.group_members gm2 on gm1.group_id = gm2.group_id
      where gm1.user_id = auth.uid()
    )
  );

-- Points
create table if not exists public.points (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  points integer not null,
  reason text not null,
  created_at timestamptz default now() not null
);

alter table public.points enable row level security;

create policy "Users can manage own points"
  on public.points for all using (auth.uid() = user_id);

create policy "Group members can view each others points"
  on public.points for select
  using (
    user_id in (
      select gm2.user_id from public.group_members gm1
      join public.group_members gm2 on gm1.group_id = gm2.group_id
      where gm1.user_id = auth.uid()
    )
  );

-- Auto-create streak row for new users
create or replace function public.handle_new_profile()
returns trigger as $$
begin
  insert into public.streaks (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.handle_new_profile();

-- Leaderboard view
create or replace view public.leaderboard as
select
  p.id as user_id,
  p.display_name,
  p.avatar_url,
  coalesce(sum(pt.points), 0)::integer as total_points,
  coalesce(s.current_streak, 0) as current_streak
from public.profiles p
left join public.points pt on p.id = pt.user_id
left join public.streaks s on p.id = s.user_id
group by p.id, p.display_name, p.avatar_url, s.current_streak;
