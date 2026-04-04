-- Add reminder preferences to profiles
-- Run this in Supabase SQL Editor

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS reminder_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS reminder_days text[] DEFAULT '{mon,tue,wed,thu,fri}',
  ADD COLUMN IF NOT EXISTS reminder_hour integer DEFAULT 7;
