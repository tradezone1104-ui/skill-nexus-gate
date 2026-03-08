
CREATE TABLE public.reseller_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  promotion_channels text[] NOT NULL DEFAULT '{}',
  promotion_strategy text,
  status text NOT NULL DEFAULT 'pending',
  admin_note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.reseller_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own applications"
  ON public.reseller_applications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON public.reseller_applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE UNIQUE INDEX reseller_applications_user_id_idx ON public.reseller_applications (user_id);
