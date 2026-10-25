ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shipping_provider text NOT NULL DEFAULT 'dhl',
  ADD COLUMN IF NOT EXISTS shipping_service text,
  ADD COLUMN IF NOT EXISTS topship_shipment_id text,
  ADD COLUMN IF NOT EXISTS topship_tracking_id text,
  ADD COLUMN IF NOT EXISTS topship_tracking_url text,
  ADD COLUMN IF NOT EXISTS topship_label_url text;;
