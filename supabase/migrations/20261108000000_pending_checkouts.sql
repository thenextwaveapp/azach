-- Holds the fully-validated checkout payload between "create Stripe session" and
-- "order created". Stripe metadata caps each value at 500 chars, which the cart +
-- shipping address + discount payload blows past, so we stash it here and pass only
-- this row's id to Stripe (client_reference_id). The webhook / verify fallback reads
-- it back to build the order from server-trusted amounts rather than anything the
-- client sent. Rows are deleted once their order is created; a daily sweep clears
-- abandoned ones.
CREATE TABLE IF NOT EXISTS public.pending_checkouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid,
  stripe_session_id text,
  payload jsonb NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pending_checkouts_created_at
  ON public.pending_checkouts (created_at);

-- Service-role only. Edge functions use the service role key (which bypasses RLS);
-- enabling RLS with no policies keeps the table unreadable via the anon/public key.
ALTER TABLE public.pending_checkouts ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.pending_checkouts IS
  'Transient server-trusted checkout payloads keyed by id; passed to Stripe as client_reference_id and consumed on order creation.';
