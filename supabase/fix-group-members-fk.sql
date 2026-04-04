-- Fix: Add foreign key from group_members to profiles
-- This allows Supabase PostgREST to join group_members with profiles
-- Run this in Supabase SQL Editor

ALTER TABLE public.group_members
  ADD CONSTRAINT group_members_user_id_profiles_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
