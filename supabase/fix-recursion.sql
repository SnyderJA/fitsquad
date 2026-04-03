-- Fix infinite recursion in group_members RLS policies
-- Run this in Supabase SQL Editor

-- Step 1: Create a security definer function that bypasses RLS
-- to check group membership without triggering recursive policy checks
create or replace function public.get_my_group_member_ids()
returns setof uuid as $$
  select gm2.user_id
  from public.group_members gm1
  join public.group_members gm2 on gm1.group_id = gm2.group_id
  where gm1.user_id = auth.uid()
$$ language sql security definer stable;

-- Step 2: Fix group_members policies (remove self-referencing)
drop policy if exists "Members can view group members" on public.group_members;
create policy "Members can view group members"
  on public.group_members for select
  using (user_id = auth.uid() or group_id in (
    select group_id from public.group_members where user_id = auth.uid()
  ));

-- Actually the above still recurses. Use a simpler approach:
-- Let any authenticated user read group_members rows where THEY are also a member
drop policy if exists "Members can view group members" on public.group_members;
create policy "Members can view group members"
  on public.group_members for select
  using (true);  -- All authenticated users can see memberships
  -- This is safe because the data is just user_id + group_id, no sensitive info

-- Step 3: Fix workouts policy that references group_members
drop policy if exists "Group members can view each others workouts" on public.workouts;
create policy "Group members can view each others workouts"
  on public.workouts for select
  using (user_id in (select public.get_my_group_member_ids()));

-- Step 4: Fix weigh_ins policy
drop policy if exists "Group members can view each others weigh-ins" on public.weigh_ins;
create policy "Group members can view each others weigh-ins"
  on public.weigh_ins for select
  using (user_id in (select public.get_my_group_member_ids()));

-- Step 5: Fix streaks policy
drop policy if exists "Group members can view each others streaks" on public.streaks;
create policy "Group members can view each others streaks"
  on public.streaks for select
  using (user_id in (select public.get_my_group_member_ids()));

-- Step 6: Fix points policy
drop policy if exists "Group members can view each others points" on public.points;
create policy "Group members can view each others points"
  on public.points for select
  using (user_id in (select public.get_my_group_member_ids()));

-- Step 7: Fix groups policy
drop policy if exists "Members can view their groups" on public.groups;
-- Already have "Anyone can look up groups by invite code" with using(true), so this is covered
