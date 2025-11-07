import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { productToDisplay } from "@/utils/productHelpers";
import { Product } from "@/types/product";

interface RelatedProductsProps {
  currentProduct: Product;
  limit?: number;
}

export const RelatedProducts = ({ currentProduct, limit = 4 }: RelatedProductsProps) => {
  const { data: allProducts = [] } = useProducts();

  // Find related products (same category or gender, excluding current product)
  const relatedProducts = allProducts
    .filter(
      (product) =>
        product.id !== currentProduct.id &&
        (product.category === currentProduct.category ||
          product.gender === currentProduct.gender)
    )
    .slice(0, limit);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Complete the Look</h2>
        <p className="text-muted-foreground">
          Pair this item with complementary pieces
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {relatedProducts.map((product) => (
          <ProductCard
            key={product.id}
            {...productToDisplay(product)}
            product={product}
          />
        ))}
      </div>
    </div>
  );
};

