
CREATE TABLE public.exchange_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  offer_course_name TEXT NOT NULL,
  offer_course_author TEXT NOT NULL,
  offer_platform TEXT NOT NULL DEFAULT 'Other',
  offer_course_link TEXT,
  offer_screenshot_url TEXT,
  want_course_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.exchange_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own exchange requests"
  ON public.exchange_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exchange requests"
  ON public.exchange_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exchange requests"
  ON public.exchange_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
