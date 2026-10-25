-- Strip CAD/GBP/EUR out of currency_prices — USD and NGN only from here on
UPDATE public.products
SET currency_prices = (currency_prices - 'CAD' - 'GBP' - 'EUR');

-- Track which currency an order was actually charged in (Paystack supports NGN + USD for this account)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'NGN';

-- Single source of truth for the NGN shipping quote -> USD conversion used only at USD checkout
-- (DHL rates are always quoted/cached in NGN; product prices are never converted this way).
CREATE TABLE IF NOT EXISTS public.site_settings (
  id BOOLEAN PRIMARY KEY DEFAULT true,
  usd_to_ngn_rate NUMERIC NOT NULL DEFAULT 1600,
  CONSTRAINT site_settings_singleton CHECK (id)
);
INSERT INTO public.site_settings (id) VALUES (true) ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site settings"
  ON public.site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can update site settings"
  ON public.site_settings FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
;
