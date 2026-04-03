-- Add workout feedback table
-- Run this in Supabase SQL Editor

create table if not exists public.workout_feedback (
  id uuid default gen_random_uuid() primary key,
  workout_id uuid references public.workouts on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  difficulty text not null check (difficulty in ('easy', 'just_right', 'hard')),
  enjoyment text not null check (enjoyment in ('liked', 'ok', 'hated')),
  created_at timestamptz default now() not null
);

alter table public.workout_feedback enable row level security;

create policy "Users can insert own feedback"
  on public.workout_feedback for insert with check (auth.uid() = user_id);

create policy "Users can read own feedback"
  on public.workout_feedback for select using (auth.uid() = user_id);

-- Table to track exercises the user never wants to see again
create table if not exists public.blocked_exercises (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  exercise_name text not null,
  created_at timestamptz default now() not null,
  unique(user_id, exercise_name)
);

alter table public.blocked_exercises enable row level security;

create policy "Users can manage own blocked exercises"
  on public.blocked_exercises for select using (auth.uid() = user_id);

create policy "Users can insert own blocked exercises"
  on public.blocked_exercises for insert with check (auth.uid() = user_id);

create policy "Users can delete own blocked exercises"
  on public.blocked_exercises for delete using (auth.uid() = user_id);
