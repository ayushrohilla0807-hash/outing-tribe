
CREATE TABLE public.rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outing_id uuid NOT NULL REFERENCES public.outings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (outing_id, user_id)
);

GRANT SELECT, INSERT, DELETE ON public.rsvps TO authenticated;
GRANT ALL ON public.rsvps TO service_role;

ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signed-in users can view rsvps"
  ON public.rsvps FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can rsvp for themselves"
  ON public.rsvps FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel their own rsvp"
  ON public.rsvps FOR DELETE TO authenticated USING (auth.uid() = user_id);

ALTER TABLE public.outings REPLICA IDENTITY FULL;
ALTER TABLE public.rsvps REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.outings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rsvps;
