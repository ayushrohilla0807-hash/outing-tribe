
ALTER TABLE public.outings ALTER COLUMN host_id DROP NOT NULL;
ALTER TABLE public.outings ADD COLUMN host_name TEXT;
ALTER TABLE public.outings ADD COLUMN host_avatar_url TEXT;
DROP POLICY "Signed-in users can create outings" ON public.outings;
CREATE POLICY "Signed-in users can create outings"
  ON public.outings FOR INSERT TO authenticated
  WITH CHECK (host_id = auth.uid());
