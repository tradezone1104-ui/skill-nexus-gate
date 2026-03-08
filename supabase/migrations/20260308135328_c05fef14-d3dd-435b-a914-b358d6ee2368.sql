
ALTER TABLE public.exchange_requests ADD COLUMN want_type TEXT NOT NULL DEFAULT 'specific';

ALTER TABLE public.sell_requests ADD COLUMN admin_offer_price NUMERIC;
