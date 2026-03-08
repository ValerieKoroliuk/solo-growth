CREATE TABLE public.user_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  google_access_token text,
  google_refresh_token text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own tokens" ON public.user_tokens FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tokens" ON public.user_tokens FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tokens" ON public.user_tokens FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tokens" ON public.user_tokens FOR DELETE TO authenticated USING (auth.uid() = user_id);