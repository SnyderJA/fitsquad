-- Add fitness profile fields
-- Run this in Supabase SQL Editor

alter table public.profiles
  add column if not exists gender text check (gender in ('male', 'female', 'other')),
  add column if not exists limitations text[] default '{}',
  add column if not exists pushup_count integer;
