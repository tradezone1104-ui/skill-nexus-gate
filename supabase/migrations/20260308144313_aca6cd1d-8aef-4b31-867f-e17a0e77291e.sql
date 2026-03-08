
-- CV Coins balance table
CREATE TABLE public.cv_coin_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  balance integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.cv_coin_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own balance" ON public.cv_coin_balances FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own balance" ON public.cv_coin_balances FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own balance" ON public.cv_coin_balances FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- CV Coins transaction history
CREATE TABLE public.cv_coin_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  coins integer NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.cv_coin_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions" ON public.cv_coin_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.cv_coin_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
