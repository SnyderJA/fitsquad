-- Reset codes table for password reset flow
-- Run this in Supabase SQL Editor

create table if not exists public.reset_codes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade unique not null,
  code text not null,
  expires_at timestamptz not null,
  used boolean default false not null,
  created_at timestamptz default now() not null
);

-- No RLS needed — only accessed via service role key from API routes
