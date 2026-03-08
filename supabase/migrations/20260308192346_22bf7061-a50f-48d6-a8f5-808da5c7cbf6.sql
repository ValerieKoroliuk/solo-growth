
-- Create habits table
CREATE TABLE public.habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  icon text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own habits" ON public.habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habits" ON public.habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habits" ON public.habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own habits" ON public.habits FOR DELETE USING (auth.uid() = user_id);

-- Create daily_data table
CREATE TABLE public.daily_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  checkins text[] DEFAULT '{}',
  habits_done text[] DEFAULT '{}',
  journal text DEFAULT '',
  score integer DEFAULT 0,
  UNIQUE (user_id, date)
);

ALTER TABLE public.daily_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own daily_data" ON public.daily_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily_data" ON public.daily_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily_data" ON public.daily_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own daily_data" ON public.daily_data FOR DELETE USING (auth.uid() = user_id);

-- Create logs table
CREATE TABLE public.logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own logs" ON public.logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own logs" ON public.logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own logs" ON public.logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own logs" ON public.logs FOR DELETE USING (auth.uid() = user_id);
