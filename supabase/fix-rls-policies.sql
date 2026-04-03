-- Fix RLS policies that need WITH CHECK for INSERT operations
-- Run this in Supabase SQL Editor

-- Workouts: drop and recreate with proper INSERT support
drop policy if exists "Users can manage own workouts" on public.workouts;
create policy "Users can read own workouts"
  on public.workouts for select using (auth.uid() = user_id);
create policy "Users can insert own workouts"
  on public.workouts for insert with check (auth.uid() = user_id);
create policy "Users can update own workouts"
  on public.workouts for update using (auth.uid() = user_id);
create policy "Users can delete own workouts"
  on public.workouts for delete using (auth.uid() = user_id);

-- Weigh-ins: same fix
drop policy if exists "Users can manage own weigh-ins" on public.weigh_ins;
create policy "Users can read own weigh-ins"
  on public.weigh_ins for select using (auth.uid() = user_id);
create policy "Users can insert own weigh-ins"
  on public.weigh_ins for insert with check (auth.uid() = user_id);
create policy "Users can update own weigh-ins"
  on public.weigh_ins for update using (auth.uid() = user_id);
create policy "Users can delete own weigh-ins"
  on public.weigh_ins for delete using (auth.uid() = user_id);

-- Streaks: same fix
drop policy if exists "Users can manage own streaks" on public.streaks;
create policy "Users can read own streaks"
  on public.streaks for select using (auth.uid() = user_id);
create policy "Users can insert own streaks"
  on public.streaks for insert with check (auth.uid() = user_id);
create policy "Users can update own streaks"
  on public.streaks for update using (auth.uid() = user_id);

-- Points: same fix
drop policy if exists "Users can manage own points" on public.points;
create policy "Users can read own points"
  on public.points for select using (auth.uid() = user_id);
create policy "Users can insert own points"
  on public.points for insert with check (auth.uid() = user_id);
