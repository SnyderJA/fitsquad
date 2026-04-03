-- Add kettlebell weights to profiles
-- Run this in Supabase SQL Editor

alter table public.profiles
  add column if not exists kettlebell_weights integer[] default '{}';
