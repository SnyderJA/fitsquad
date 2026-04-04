-- Add archived column to workouts
-- Run this in Supabase SQL Editor

ALTER TABLE public.workouts
  ADD COLUMN IF NOT EXISTS archived boolean DEFAULT false NOT NULL;
