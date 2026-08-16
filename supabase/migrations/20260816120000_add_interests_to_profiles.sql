-- Add interests array to profiles
alter table public.profiles
  add column if not exists interests text[] default '{}';

-- Flag to track whether the user has completed the profile setup wizard
alter table public.profiles
  add column if not exists profile_setup_complete boolean not null default false;
