// The standard AZACH size run. Admin picks which of these a product is offered in
// (with a stock count per size); the customer picks one of those on the product page.
// Letter sizes (XS–4XL) plus UK dress sizes 6–28 (female garments only).
export const ALL_SIZES = [
  'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL',
  'UK 6', 'UK 8', 'UK 10', 'UK 12', 'UK 14', 'UK 16', 'UK 18', 'UK 20', 'UK 22', 'UK 24', 'UK 26', 'UK 28',
];

const sizeOrder = (size: string) => {
  const idx = ALL_SIZES.indexOf(size);
  return idx === -1 ? ALL_SIZES.length : idx;
};

// Standard sizes in run order first, then per-product custom sizes (numeric-aware,
// so inch labels sort 30 < 32 < 34 rather than alphabetically).
export const sortSizes = (sizes: string[]): string[] =>
  [...sizes].sort(
    (a, b) => sizeOrder(a) - sizeOrder(b) || a.localeCompare(b, undefined, { numeric: true })
  );

interface SizedProduct {
  size_stock?: Record<string, number> | null;
  sizes?: string[] | null;
  size?: string | null;
}

// Sizes a product can be ordered in (including currently sold-out ones, so they can
// be shown as unavailable). Driven purely by what admin ticked (size_stock, with the
// trigger-maintained sizes array as backup) — the legacy single `size` field is
// deliberately NOT used, so the customer dropdown always matches the admin picker.
// Empty means the product has no size dimension (e.g. accessories): no selector shown.
export const getAvailableSizes = (product: SizedProduct): string[] => {
  if (product.size_stock && Object.keys(product.size_stock).length > 0) {
    return sortSizes(Object.keys(product.size_stock));
  }
  if (product.sizes && product.sizes.length > 0) return product.sizes;
  return [];
};

// Stock for one size; null when the product doesn't track stock per size
// (bundles, legacy products), meaning availability is governed by total stock.
export const getSizeStock = (product: SizedProduct, size: string): number | null =>
  product.size_stock && size in product.size_stock ? product.size_stock[size] : null;

export const isSizeAvailable = (product: SizedProduct, size: string): boolean => {
  const stock = getSizeStock(product, size);
  return stock === null || stock > 0;
};
