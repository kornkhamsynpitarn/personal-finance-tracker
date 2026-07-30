-- Run this once in your Supabase project's SQL Editor (Project > SQL Editor > New query).
-- It creates one table that stores each signed-in user's entire app state as JSON,
-- and locks it down so a user can only ever read or write their own row.

create table if not exists public.user_data (
  user_id uuid references auth.users(id) on delete cascade primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_data enable row level security;

create policy "Users can view their own data"
  on public.user_data for select
  using (auth.uid() = user_id);

create policy "Users can insert their own data"
  on public.user_data for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own data"
  on public.user_data for update
  using (auth.uid() = user_id);
