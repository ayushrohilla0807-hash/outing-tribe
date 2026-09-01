-- =========================================================
-- OutSy Privacy Migration: Outing-Specific Group Chat Only
-- Discards direct 1-to-1 messaging at the database RLS level.
-- Only authorized outing participants (host + joined members)
-- may view or send messages.
-- =========================================================

-- 1. Ensure receiver_id is nullable (group messages have no single receiver)
alter table public.messages alter column receiver_id drop not null;

-- 2. Ensure group_id column exists
alter table public.messages add column if not exists group_id uuid references public.group_conversations(id) on delete cascade;

-- 3. Enable RLS on messages
alter table public.messages enable row level security;

-- 4. Recreate RLS Policies on public.messages
drop policy if exists "Users can view messages for outings they are authorized in" on public.messages;
drop policy if exists "Users can send messages to outings they belong to" on public.messages;
drop policy if exists "Users can view group messages for outings they belong to" on public.messages;
drop policy if exists "Users can send group messages to outings they belong to" on public.messages;

-- SELECT Policy: Only host, accepted ('joined') participants, or active group members can read messages for an outing
create policy "Users can view messages for outings they belong to"
on public.messages for select
using (
    -- User is the host of the outing
    exists (
        select 1 from public.outings
        where public.outings.id = public.messages.outing_id
        and public.outings.host_id = auth.uid()
    )
    -- Or user is an accepted participant of the outing
    or exists (
        select 1 from public.participants
        where public.participants.outing_id = public.messages.outing_id
        and public.participants.user_id = auth.uid()
        and public.participants.status = 'joined'
    )
    -- Or user is registered in group_members for that group
    or (
        public.messages.group_id is not null
        and exists (
            select 1 from public.group_members
            where public.group_members.group_id = public.messages.group_id
            and public.group_members.user_id = auth.uid()
        )
    )
);

-- INSERT Policy: Only authenticated host, accepted ('joined') participants, or active group members can send messages
create policy "Users can send messages to outings they belong to"
on public.messages for insert
with check (
    -- Sender must be the authenticated user
    auth.uid() = sender_id
    and (
        -- User is the host of the outing
        exists (
            select 1 from public.outings
            where public.outings.id = public.messages.outing_id
            and public.outings.host_id = auth.uid()
        )
        -- Or user is an accepted participant of the outing
        or exists (
            select 1 from public.participants
            where public.participants.outing_id = public.messages.outing_id
            and public.participants.user_id = auth.uid()
            and public.participants.status = 'joined'
        )
        -- Or user is in group_members
        or (
            public.messages.group_id is not null
            and exists (
                select 1 from public.group_members
                where public.group_members.group_id = public.messages.group_id
                and public.group_members.user_id = auth.uid()
            )
        )
    )
);

-- 5. Safely add messages to supabase_realtime publication
do $$
begin
    alter publication supabase_realtime add table public.messages;
exception
    when others then null;
end;
$$;
