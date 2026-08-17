-- =========================================================
-- OutSy Production Database Migration
-- Tables: profiles, outings, participants, messages, saved_outings
-- =========================================================

create extension if not exists pgcrypto;

-- 1. Updated At Trigger Function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2. Profiles Table
create table if not exists public.profiles (
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

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- Auto Create Profile Trigger on auth.users
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
    on conflict (id) do update
    set full_name = coalesce(public.profiles.full_name, excluded.full_name),
        avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url);

    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- 3. Outings Table
create table if not exists public.outings (
    id uuid primary key default gen_random_uuid(),
    host_id uuid not null references public.profiles(id) on delete cascade,
    title text not null,
    description text not null default '',
    category text not null,
    location text not null,
    city text not null default '',
    outing_date text not null,
    start_time text not null,
    end_time text,
    max_participants integer not null default 5 check (max_participants > 0),
    price numeric default 0,
    rules text,
    cover_image text,
    interests text[] default '{}',
    status text not null default 'upcoming' check (status in ('upcoming', 'completed', 'cancelled')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

drop trigger if exists outings_updated_at on public.outings;
create trigger outings_updated_at
before update on public.outings
for each row
execute function public.set_updated_at();

-- 4. Participants Table
-- Rules: status is strictly 'pending' or 'joined'
create table if not exists public.participants (
    id uuid primary key default gen_random_uuid(),
    outing_id uuid not null references public.outings(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    status text not null default 'pending' check (status in ('pending', 'joined')),
    joined_at timestamptz not null default now(),
    constraint unique_outing_participant unique (outing_id, user_id)
);

-- 5. Messages Table
create table if not exists public.messages (
    id uuid primary key default gen_random_uuid(),
    outing_id uuid not null references public.outings(id) on delete cascade,
    sender_id uuid not null references public.profiles(id) on delete cascade,
    receiver_id uuid not null references public.profiles(id) on delete cascade,
    message text not null,
    created_at timestamptz not null default now()
);

-- 6. Saved Outings Table (optional DB persistence)
create table if not exists public.saved_outings (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    outing_id uuid not null references public.outings(id) on delete cascade,
    created_at timestamptz not null default now(),
    constraint unique_user_saved_outing unique (user_id, outing_id)
);

-- =========================================================
-- Enable Row Level Security (RLS)
-- =========================================================

alter table public.profiles enable row level security;
alter table public.outings enable row level security;
alter table public.participants enable row level security;
alter table public.messages enable row level security;
alter table public.saved_outings enable row level security;

-- Profiles Policies
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
on public.profiles for select
using (true);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id);

-- Outings Policies
drop policy if exists "Outings are viewable by everyone" on public.outings;
create policy "Outings are viewable by everyone"
on public.outings for select
using (true);

drop policy if exists "Users can create their own outings" on public.outings;
create policy "Users can create their own outings"
on public.outings for insert
with check (auth.uid() = host_id);

drop policy if exists "Hosts can update their own outings" on public.outings;
create policy "Hosts can update their own outings"
on public.outings for update
using (auth.uid() = host_id);

drop policy if exists "Hosts can delete their own outings" on public.outings;
create policy "Hosts can delete their own outings"
on public.outings for delete
using (auth.uid() = host_id);

-- Participants Policies
drop policy if exists "Participants viewable by host, participant, or public" on public.participants;
create policy "Participants viewable by host, participant, or public"
on public.participants for select
using (true);

drop policy if exists "Users can request to join outings" on public.participants;
create policy "Users can request to join outings"
on public.participants for insert
with check (auth.uid() = user_id);

drop policy if exists "Hosts can update participant status" on public.participants;
create policy "Hosts can update participant status"
on public.participants for update
using (
    exists (
        select 1 from public.outings
        where public.outings.id = public.participants.outing_id
        and public.outings.host_id = auth.uid()
    )
)
with check (
    exists (
        select 1 from public.outings
        where public.outings.id = public.participants.outing_id
        and public.outings.host_id = auth.uid()
    )
);

drop policy if exists "Users can leave or hosts can remove/reject participants" on public.participants;
create policy "Users can leave or hosts can remove/reject participants"
on public.participants for delete
using (
    auth.uid() = user_id
    or exists (
        select 1 from public.outings
        where public.outings.id = public.participants.outing_id
        and public.outings.host_id = auth.uid()
    )
);

-- Messages Policies
drop policy if exists "Users can view messages for outings they are authorized in" on public.messages;
create policy "Users can view messages for outings they are authorized in"
on public.messages for select
using (
    auth.uid() = sender_id
    or auth.uid() = receiver_id
    or exists (
        select 1 from public.outings
        where public.outings.id = public.messages.outing_id
        and public.outings.host_id = auth.uid()
    )
    or exists (
        select 1 from public.participants
        where public.participants.outing_id = public.messages.outing_id
        and public.participants.user_id = auth.uid()
        and public.participants.status = 'joined'
    )
);

drop policy if exists "Users can send messages to outings they belong to" on public.messages;
create policy "Users can send messages to outings they belong to"
on public.messages for insert
with check (
    auth.uid() = sender_id
    and (
        exists (
            select 1 from public.outings
            where public.outings.id = public.messages.outing_id
            and public.outings.host_id = auth.uid()
        )
        or exists (
            select 1 from public.participants
            where public.participants.outing_id = public.messages.outing_id
            and public.participants.user_id = auth.uid()
            and public.participants.status = 'joined'
        )
    )
);

-- Saved Outings Policies
drop policy if exists "Users can view own saved outings" on public.saved_outings;
create policy "Users can view own saved outings"
on public.saved_outings for select
using (auth.uid() = user_id);

drop policy if exists "Users can save outings" on public.saved_outings;
create policy "Users can save outings"
on public.saved_outings for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can remove saved outings" on public.saved_outings;
create policy "Users can remove saved outings"
on public.saved_outings for delete
using (auth.uid() = user_id);

-- Indexes for performance
create index if not exists idx_outings_host_id on public.outings(host_id);
create index if not exists idx_outings_status on public.outings(status);
create index if not exists idx_participants_outing_id on public.participants(outing_id);
create index if not exists idx_participants_user_id on public.participants(user_id);
create index if not exists idx_participants_status on public.participants(status);
create index if not exists idx_messages_outing_id on public.messages(outing_id);
create index if not exists idx_messages_sender_receiver on public.messages(sender_id, receiver_id);
