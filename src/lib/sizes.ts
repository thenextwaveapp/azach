// The standard AZACH size run. Admin picks which of these a product is offered in
// (with a stock count per size); the customer picks one of those on the product page.
export const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];

// UK dress-size equivalents (women's sizing only) — shown as a hint in the admin
// form, taken from the size guide chart.
export const UK_SIZE_LABELS: Record<string, string> = {
  XS: 'UK 6',
  S: 'UK 8–10',
  M: 'UK 12',
  L: 'UK 14',
  XL: 'UK 16–18',
  XXL: 'UK 20–22',
  '3XL': 'UK 24',
  '4XL': 'UK 26–28',
};

const sizeOrder = (size: string) => {
  const idx = ALL_SIZES.indexOf(size);
  return idx === -1 ? ALL_SIZES.length : idx;
};

export const sortSizes = (sizes: string[]): string[] =>
  [...sizes].sort((a, b) => sizeOrder(a) - sizeOrder(b) || a.localeCompare(b));

interface SizedProduct {
  size_stock?: Record<string, number> | null;
  sizes?: string[] | null;
  size?: string | null;
}

// Sizes a product can be ordered in (including currently sold-out ones, so they can
// be shown as unavailable). Falls back to the legacy fields for products from before
// sizes became customer-selectable; empty means the product has no size dimension
// (e.g. accessories) and no selector is shown.
export const getAvailableSizes = (product: SizedProduct): string[] => {
  if (product.size_stock && Object.keys(product.size_stock).length > 0) {
    return sortSizes(Object.keys(product.size_stock));
  }
  if (product.sizes && product.sizes.length > 0) return product.sizes;
  if (product.size) return [product.size];
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
