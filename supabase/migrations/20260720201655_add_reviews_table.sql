
CREATE TABLE reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  user_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  verified_purchase boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_status ON reviews(status);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved reviews
CREATE POLICY "Approved reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (status = 'approved');

-- Users can see their own reviews regardless of status
CREATE POLICY "Users can view their own reviews"
  ON reviews FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all reviews
CREATE POLICY "Admins can view all reviews"
  ON reviews FOR SELECT
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

-- Authenticated users can submit a review tied to their own account
CREATE POLICY "Authenticated users can insert their own reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only admins can moderate (update status) or delete reviews
CREATE POLICY "Admins can update reviews"
  ON reviews FOR UPDATE
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Admins can delete reviews"
  ON reviews FOR DELETE
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

-- Force new reviews to start pending and stamp verified_purchase server-side,
-- so clients cannot self-approve or fake a verified purchase.
CREATE OR REPLACE FUNCTION reviews_before_insert()
RETURNS trigger AS $$
BEGIN
  NEW.status := 'pending';
  NEW.verified_purchase := EXISTS (
    SELECT 1
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    WHERE o.user_id = NEW.user_id
      AND oi.product_id = NEW.product_id
      AND o.payment_status = 'paid'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER reviews_before_insert_trigger
  BEFORE INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION reviews_before_insert();

CREATE OR REPLACE FUNCTION reviews_set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_set_updated_at_trigger
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION reviews_set_updated_at();
;
