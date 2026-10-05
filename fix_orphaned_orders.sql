-- Fix orders that were created without user_id due to the webhook bug
-- This script links orphaned orders to their rightful users based on email

-- Update orders where user_id is null but we have an email in shipping_address
UPDATE orders
SET user_id = auth.users.id
FROM auth.users
WHERE orders.user_id IS NULL
  AND orders.shipping_address->>'email' = auth.users.email;

-- Show the fixed orders
SELECT
  o.id,
  o.created_at,
  o.total,
  o.shipping_address->>'email' as email,
  u.email as user_email,
  o.status
FROM orders o
LEFT JOIN auth.users u ON o.user_id = u.id
WHERE o.created_at > NOW() - INTERVAL '1 day'
ORDER BY o.created_at DESC;
