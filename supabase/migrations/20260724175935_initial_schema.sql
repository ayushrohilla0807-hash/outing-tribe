-- =========================
-- Extensions
-- =========================
create extension if not exists pgcrypto;

-- =========================
-- Updated At Trigger
-- =========================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================
-- Profiles
-- =========================
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,

    full_name text,
    username text unique,
    avatar_url text,
    bio text,

    college text,
    city text,
    gender text,
    date_of_birth date,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create trigger profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- =========================
-- Auto Create Profile
-- =========================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (
        id,
        full_name,
        avatar_url
    )
    values (
        new.id,
        coalesce(
            new.raw_user_meta_data->>'full_name',
            split_part(new.email,'@',1)
        ),
        new.raw_user_meta_data->>'avatar_url'
    )
    on conflict (id) do nothing;

    return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- =========================
-- RLS
-- =========================
alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
on public.profiles
for select
using (true);

create policy "Users can insert own profile"
on public.profiles
for insert
with check (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id);

create policy "Users can delete own profile"
on public.profiles
for delete
using (auth.uid() = id);