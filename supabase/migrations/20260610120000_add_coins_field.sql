-- ADD COINS AND PAYMENT LEDGER
-- Tanggal: 10 Juni 2026

ALTER TABLE public.user_profiles_extended ADD COLUMN IF NOT EXISTS coins integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  amount_koin integer NOT NULL,
  amount_rupiah integer NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending, success, failed
  reference_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can read payment transactions" ON public.payment_transactions FOR SELECT USING (true);
CREATE POLICY "Anyone can manage payment transactions" ON public.payment_transactions FOR ALL USING (true);
