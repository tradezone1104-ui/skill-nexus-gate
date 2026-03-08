
CREATE TABLE public.sell_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_name TEXT NOT NULL,
  course_author TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'Other',
  course_link TEXT,
  screenshot_url TEXT,
  expected_price NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sell_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sell requests"
  ON public.sell_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sell requests"
  ON public.sell_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sell requests"
  ON public.sell_requests FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
