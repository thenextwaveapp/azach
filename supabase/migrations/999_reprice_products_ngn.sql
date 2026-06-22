-- Reprice all products to reasonable Nigerian Naira amounts
-- Run this in Supabase Dashboard > SQL Editor

-- First, let's see current prices
-- SELECT id, name, price, category FROM products ORDER BY category, name;

-- Update products with realistic NGN pricing
-- These are suggested retail prices for Nigerian market (adjust as needed)

-- Accessories: ₦15,000 - ₦45,000
UPDATE products SET price =
  CASE
    WHEN category = 'accessories' AND price < 20000 THEN 15000
    WHEN category = 'accessories' AND price < 50000 THEN 25000
    WHEN category = 'accessories' AND price < 100000 THEN 35000
    ELSE 45000
  END
WHERE category = 'accessories';

-- Clothing/Tops: ₦25,000 - ₦75,000
UPDATE products SET price =
  CASE
    WHEN category IN ('clothing', 'tops') AND price < 30000 THEN 25000
    WHEN category IN ('clothing', 'tops') AND price < 70000 THEN 45000
    WHEN category IN ('clothing', 'tops') AND price < 120000 THEN 55000
    ELSE 75000
  END
WHERE category IN ('clothing', 'tops');

-- Bottoms: ₦30,000 - ₦85,000
UPDATE products SET price =
  CASE
    WHEN category = 'bottoms' AND price < 40000 THEN 30000
    WHEN category = 'bottoms' AND price < 80000 THEN 50000
    WHEN category = 'bottoms' AND price < 140000 THEN 65000
    ELSE 85000
  END
WHERE category = 'bottoms';

-- Footwear: ₦35,000 - ₦95,000
UPDATE products SET price =
  CASE
    WHEN category = 'footwear' AND price < 45000 THEN 35000
    WHEN category = 'footwear' AND price < 90000 THEN 55000
    WHEN category = 'footwear' AND price < 150000 THEN 75000
    ELSE 95000
  END
WHERE category = 'footwear';

-- Outerwear/Jackets: ₦45,000 - ₦125,000
UPDATE products SET price =
  CASE
    WHEN category IN ('outerwear', 'jackets') AND price < 60000 THEN 45000
    WHEN category IN ('outerwear', 'jackets') AND price < 110000 THEN 75000
    WHEN category IN ('outerwear', 'jackets') AND price < 180000 THEN 95000
    ELSE 125000
  END
WHERE category IN ('outerwear', 'jackets');

-- Verify the changes
SELECT category,
       MIN(price) as min_price,
       MAX(price) as max_price,
       AVG(price)::int as avg_price,
       COUNT(*) as product_count
FROM products
GROUP BY category
ORDER BY category;
