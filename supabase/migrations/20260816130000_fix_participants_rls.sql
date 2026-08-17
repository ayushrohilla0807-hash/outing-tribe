-- Ensure hosts can update participant status with both USING and WITH CHECK
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
