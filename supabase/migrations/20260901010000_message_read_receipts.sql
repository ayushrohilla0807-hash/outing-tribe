-- =========================================================
-- OutSy Message Read Receipts Migration
-- Table: message_reads
-- =========================================================

-- 1. Create message_reads table
create table if not exists public.message_reads (
    id uuid primary key default gen_random_uuid(),
    message_id uuid not null references public.messages(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    seen_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    constraint unique_message_user_read unique (message_id, user_id)
);

-- 2. Indexes for performance
create index if not exists idx_message_reads_message_id on public.message_reads(message_id);
create index if not exists idx_message_reads_user_id on public.message_reads(user_id);
create index if not exists idx_message_reads_seen_at on public.message_reads(seen_at);

-- 3. Enable Row Level Security (RLS)
alter table public.message_reads enable row level security;

-- 4. Recreate RLS Policies on public.message_reads
drop policy if exists "Users can view read receipts for messages in their outings" on public.message_reads;
drop policy if exists "Users can mark messages as read in their outings" on public.message_reads;

-- SELECT Policy: Only users authorized in the message's outing (host, joined participant, or group member) can read receipts
create policy "Users can view read receipts for messages in their outings"
on public.message_reads for select
using (
    exists (
        select 1 from public.messages m
        where m.id = public.message_reads.message_id
        and (
            -- Host of the outing
            exists (
                select 1 from public.outings o
                where o.id = m.outing_id
                and o.host_id = auth.uid()
            )
            -- Or joined participant
            or exists (
                select 1 from public.participants p
                where p.outing_id = m.outing_id
                and p.user_id = auth.uid()
                and p.status = 'joined'
            )
            -- Or registered group member
            or (
                m.group_id is not null
                and exists (
                    select 1 from public.group_members gm
                    where gm.group_id = m.group_id
                    and gm.user_id = auth.uid()
                )
            )
        )
    )
);

-- INSERT Policy: Authenticated users can only record their own read receipts (auth.uid() = user_id) on messages for outings they belong to
create policy "Users can mark messages as read in their outings"
on public.message_reads for insert
with check (
    auth.uid() = user_id
    and exists (
        select 1 from public.messages m
        where m.id = public.message_reads.message_id
        and (
            exists (
                select 1 from public.outings o
                where o.id = m.outing_id
                and o.host_id = auth.uid()
            )
            or exists (
                select 1 from public.participants p
                where p.outing_id = m.outing_id
                and p.user_id = auth.uid()
                and p.status = 'joined'
            )
            or (
                m.group_id is not null
                and exists (
                    select 1 from public.group_members gm
                    where gm.group_id = m.group_id
                    and gm.user_id = auth.uid()
                )
            )
        )
    )
);

-- 5. Safely add message_reads to supabase_realtime publication
do $$
begin
    alter publication supabase_realtime add table public.message_reads;
exception
    when others then null;
end;
$$;
