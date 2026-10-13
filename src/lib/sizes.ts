// The standard AZACH size run. Admin picks which of these a product is offered in;
// the customer picks one of those on the product page.
export const ALL_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

// Sizes a product can be ordered in. Falls back to the legacy single `size` field for
// products uploaded before sizes became customer-selectable; empty means the product
// has no size dimension (e.g. accessories) and no selector is shown.
export const getAvailableSizes = (product: {
  sizes?: string[] | null;
  size?: string | null;
}): string[] => {
  if (product.sizes && product.sizes.length > 0) return product.sizes;
  if (product.size) return [product.size];
  return [];
};
