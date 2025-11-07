import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { Newsletter } from "@/components/Newsletter";
import { ProductFilters } from "@/components/ProductFilters";
import { useProductsByGender } from "@/hooks/useProducts";
import { productToDisplay } from "@/utils/productHelpers";
import { useState, useMemo, useEffect } from "react";
import { Product } from "@/types/product";

const Women = () => {
  const { data: womenProducts = [], isLoading } = useProductsByGender('women');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(womenProducts);

  // Get unique categories and max price
  const { categories, maxPrice } = useMemo(() => {
    const uniqueCategories = Array.from(new Set(womenProducts.map(p => p.category)));
    const max = womenProducts.length > 0
      ? Math.max(...womenProducts.map(p => p.price))
      : 1000;
    return { categories: uniqueCategories, maxPrice: max };
  }, [womenProducts]);

  // Set page title
  useEffect(() => {
    document.title = "Women's Collection - AZACH";
  }, []);

  // Update filtered products when original products change
  useEffect(() => {
    setFilteredProducts(womenProducts);
  }, [womenProducts]);

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Women's Collection</h1>
            <p className="text-lg text-muted-foreground">
              Elegant and timeless pieces for the modern woman
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : womenProducts.length > 0 ? (
            <>
              <ProductFilters
                products={womenProducts}
                onProductsChange={setFilteredProducts}
                availableCategories={categories}
                maxPrice={maxPrice}
              />
              {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} {...productToDisplay(product)} product={product} />
              ))}
            </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No products match your filters.</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No women's products available.</p>
            </div>
          )}
        </div>
      </section>

      <Newsletter />
    </div>
  );
};

export default Women;

