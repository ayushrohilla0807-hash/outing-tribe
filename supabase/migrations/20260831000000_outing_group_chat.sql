-- =========================================================
-- OutSy Outing Group Chat Migration
-- Tables: group_conversations, group_members, updated messages
-- =========================================================

-- 1. Create group_conversations Table
-- Exactly ONE group conversation per outing (enforced by UNIQUE constraint on outing_id)
create table if not exists public.group_conversations (
    id uuid primary key default gen_random_uuid(),
    outing_id uuid not null unique references public.outings(id) on delete cascade,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

drop trigger if exists group_conversations_updated_at on public.group_conversations;
create trigger group_conversations_updated_at
before update on public.group_conversations
for each row
execute function public.set_updated_at();

-- 2. Create group_members Table
create table if not exists public.group_members (
    id uuid primary key default gen_random_uuid(),
    group_id uuid not null references public.group_conversations(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    role text not null default 'member' check (role in ('host', 'member')),
    joined_at timestamptz not null default now(),
    last_read_at timestamptz default now(),
    constraint unique_group_member unique (group_id, user_id)
);

-- 3. Modify messages Table to support group messages
-- Make receiver_id nullable (null for group messages)
alter table public.messages alter column receiver_id drop not null;

-- Add group_id referencing group_conversations
alter table public.messages add column if not exists group_id uuid references public.group_conversations(id) on delete cascade;

-- 4. Enable Row Level Security (RLS)
alter table public.group_conversations enable row level security;
alter table public.group_members enable row level security;

-- Policies for group_conversations
drop policy if exists "Group conversations viewable by authorized users" on public.group_conversations;
create policy "Group conversations viewable by authorized users"
on public.group_conversations for select
using (
    exists (
        select 1 from public.group_members
        where public.group_members.group_id = public.group_conversations.id
        and public.group_members.user_id = auth.uid()
    )
    or exists (
        select 1 from public.outings
        where public.outings.id = public.group_conversations.outing_id
        and public.outings.host_id = auth.uid()
    )
    or exists (
        select 1 from public.participants
        where public.participants.outing_id = public.group_conversations.outing_id
        and public.participants.user_id = auth.uid()
        and public.participants.status = 'joined'
    )
);

drop policy if exists "Group conversations insertable by outing hosts or participants" on public.group_conversations;
create policy "Group conversations insertable by outing hosts or participants"
on public.group_conversations for insert
with check (
    exists (
        select 1 from public.outings
        where public.outings.id = public.group_conversations.outing_id
        and (
            public.outings.host_id = auth.uid()
            or exists (
                select 1 from public.participants
                where public.participants.outing_id = public.group_conversations.outing_id
                and public.participants.user_id = auth.uid()
                and public.participants.status = 'joined'
            )
        )
    )
);

-- Policies for group_members
drop policy if exists "Group members viewable by group participants" on public.group_members;
create policy "Group members viewable by group participants"
on public.group_members for select
using (
    exists (
        select 1 from public.group_members gm
        where gm.group_id = public.group_members.group_id
        and gm.user_id = auth.uid()
    )
    or exists (
        select 1 from public.group_conversations gc
        join public.outings o on o.id = gc.outing_id
        where gc.id = public.group_members.group_id
        and o.host_id = auth.uid()
    )
    or exists (
        select 1 from public.group_conversations gc
        join public.participants p on p.outing_id = gc.outing_id
        where gc.id = public.group_members.group_id
        and p.user_id = auth.uid()
        and p.status = 'joined'
    )
);

drop policy if exists "Group members insertable by host or user" on public.group_members;
create policy "Group members insertable by host or user"
on public.group_members for insert
with check (
    -- Host can add members
    exists (
        select 1 from public.group_conversations gc
        join public.outings o on o.id = gc.outing_id
        where gc.id = public.group_members.group_id
        and o.host_id = auth.uid()
    )
    -- Or user is adding themselves if they are host or joined participant
    or (
        auth.uid() = user_id
        and (
            exists (
                select 1 from public.group_conversations gc
                join public.outings o on o.id = gc.outing_id
                where gc.id = public.group_members.group_id
                and o.host_id = auth.uid()
            )
            or exists (
                select 1 from public.group_conversations gc
                join public.participants p on p.outing_id = gc.outing_id
                where gc.id = public.group_members.group_id
                and p.user_id = auth.uid()
                and p.status = 'joined'
            )
        )
    )
);

drop policy if exists "Group members updatable by user or host" on public.group_members;
create policy "Group members updatable by user or host"
on public.group_members for update
using (
    auth.uid() = user_id
    or exists (
        select 1 from public.group_conversations gc
        join public.outings o on o.id = gc.outing_id
        where gc.id = public.group_members.group_id
        and o.host_id = auth.uid()
    )
);

drop policy if exists "Group members deletable by user or host" on public.group_members;
create policy "Group members deletable by user or host"
on public.group_members for delete
using (
    auth.uid() = user_id
    or exists (
        select 1 from public.group_conversations gc
        join public.outings o on o.id = gc.outing_id
        where gc.id = public.group_members.group_id
        and o.host_id = auth.uid()
    )
);

-- 5. Updated Messages Policies (Supporting both direct and group chats)
drop policy if exists "Users can view messages for outings they are authorized in" on public.messages;
create policy "Users can view messages for outings they are authorized in"
on public.messages for select
using (
    -- Direct chat: current user is sender or receiver
    (receiver_id is not null and (auth.uid() = sender_id or auth.uid() = receiver_id))
    or
    -- Group chat: current user is host or joined participant or group member
    (group_id is not null and (
        exists (
            select 1 from public.group_members
            where public.group_members.group_id = public.messages.group_id
            and public.group_members.user_id = auth.uid()
        )
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
    ))
);

drop policy if exists "Users can send messages to outings they belong to" on public.messages;
create policy "Users can send messages to outings they belong to"
on public.messages for insert
with check (
    auth.uid() = sender_id
    and (
        -- Direct message check
        (receiver_id is not null and (
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
        ))
        or
        -- Group message check
        (group_id is not null and (
            exists (
                select 1 from public.group_members
                where public.group_members.group_id = public.messages.group_id
                and public.group_members.user_id = auth.uid()
            )
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
        ))
    )
);

-- 6. Trigger Functions for Automatic Synchronization
-- Auto-create group conversation and add host when an outing is created
create or replace function public.handle_new_outing_group()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_group_id uuid;
begin
    -- Create group conversation for the outing if not exists
    insert into public.group_conversations (outing_id)
    values (new.id)
    on conflict (outing_id) do update set updated_at = now()
    returning id into v_group_id;

    -- Add host to group members
    if v_group_id is not null and new.host_id is not null then
        insert into public.group_members (group_id, user_id, role)
        values (v_group_id, new.host_id, 'host')
        on conflict (group_id, user_id) do nothing;
    end if;

    return new;
end;
$$;

drop trigger if exists on_outing_created_group on public.outings;
create trigger on_outing_created_group
after insert on public.outings
for each row
execute function public.handle_new_outing_group();

-- Auto sync participant to group members when accepted or removed
create or replace function public.handle_participant_group_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_group_id uuid;
begin
    -- When participant status becomes 'joined'
    if (TG_OP = 'INSERT' or TG_OP = 'UPDATE') and NEW.status = 'joined' then
        select id into v_group_id from public.group_conversations where outing_id = NEW.outing_id;
        if v_group_id is null then
            insert into public.group_conversations (outing_id)
            values (NEW.outing_id)
            on conflict (outing_id) do update set updated_at = now()
            returning id into v_group_id;
        end if;

        if v_group_id is not null then
            insert into public.group_members (group_id, user_id, role)
            values (v_group_id, NEW.user_id, 'member')
            on conflict (group_id, user_id) do nothing;
        end if;
    end if;

    -- When participant is removed / deleted / status changed away from 'joined'
    if (TG_OP = 'DELETE' or (TG_OP = 'UPDATE' and NEW.status <> 'joined')) then
        select id into v_group_id from public.group_conversations where outing_id = OLD.outing_id;
        if v_group_id is not null then
            delete from public.group_members
            where group_id = v_group_id and user_id = OLD.user_id;
        end if;
    end if;

    return coalesce(NEW, OLD);
end;
$$;

drop trigger if exists on_participant_group_sync on public.participants;
create trigger on_participant_group_sync
after insert or update or delete on public.participants
for each row
execute function public.handle_participant_group_sync();

-- 7. Indexes for performance
create index if not exists idx_group_conversations_outing_id on public.group_conversations(outing_id);
create index if not exists idx_group_members_group_id on public.group_members(group_id);
create index if not exists idx_group_members_user_id on public.group_members(user_id);
create index if not exists idx_messages_group_id on public.messages(group_id);

-- 8. Backfill existing outings and joined participants
do $$
declare
    r_outing record;
    v_gid uuid;
    r_part record;
begin
    for r_outing in select id, host_id from public.outings loop
        insert into public.group_conversations (outing_id)
        values (r_outing.id)
        on conflict (outing_id) do update set updated_at = now()
        returning id into v_gid;

        if v_gid is not null and r_outing.host_id is not null then
            insert into public.group_members (group_id, user_id, role)
            values (v_gid, r_outing.host_id, 'host')
            on conflict (group_id, user_id) do nothing;
        end if;

        if v_gid is not null then
            for r_part in select user_id from public.participants where outing_id = r_outing.id and status = 'joined' loop
                insert into public.group_members (group_id, user_id, role)
                values (v_gid, r_part.user_id, 'member')
                on conflict (group_id, user_id) do nothing;
            end loop;
        end if;
    end loop;
end;
$$;
