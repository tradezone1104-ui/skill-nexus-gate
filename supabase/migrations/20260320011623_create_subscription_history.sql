-- Create subscription_history table
CREATE TABLE IF NOT EXISTS public.subscription_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL CHECK (plan_name IN ('Monthly', 'Yearly')),
    amount NUMERIC NOT NULL,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can view their own subscription history"
    ON public.subscription_history
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription history"
    ON public.subscription_history
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Migrate existing active/cancelled subscriptions into history
INSERT INTO public.subscription_history (user_id, plan_name, amount, purchased_at)
SELECT 
    user_id,
    plan_name,
    CASE 
        WHEN plan_name = 'Monthly' THEN 499 
        WHEN plan_name = 'Yearly' THEN 3999
        ELSE 0
    END as amount,
    start_date as purchased_at
FROM public.subscriptions;
