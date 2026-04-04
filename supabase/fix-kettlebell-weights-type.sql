-- Fix kettlebell_weights column to support decimal weights (17.5, 32.5, etc.)
-- Run this in Supabase SQL Editor

ALTER TABLE public.profiles
  ALTER COLUMN kettlebell_weights TYPE numeric[] USING kettlebell_weights::numeric[];
