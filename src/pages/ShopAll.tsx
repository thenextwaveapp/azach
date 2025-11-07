import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { Newsletter } from "@/components/Newsletter";
import { ProductFilters } from "@/components/ProductFilters";
import { useProducts } from "@/hooks/useProducts";
import { productToDisplay } from "@/utils/productHelpers";
import { useState, useMemo, useEffect } from "react";
import { Product } from "@/types/product";

const ShopAll = () => {
  const { data: allProducts = [], isLoading } = useProducts();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(allProducts);

  // Get unique categories and max price
  const { categories, maxPrice } = useMemo(() => {
    const uniqueCategories = Array.from(new Set(allProducts.map(p => p.category)));
    const max = allProducts.length > 0
      ? Math.max(...allProducts.map(p => p.price))
      : 1000;
    return { categories: uniqueCategories, maxPrice: max };
  }, [allProducts]);

  // Set page title
  useEffect(() => {
    document.title = "Shop All - AZACH";
  }, []);

  // Update filtered products when original products change
  useEffect(() => {
    setFilteredProducts(allProducts);
  }, [allProducts]);

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-24 bg-muted overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/bannerbg.png)' }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-black">The Collection</h1>
            <p className="text-lg text-muted-foreground">
              Discover our complete range of upcycled denim pieces
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
          ) : allProducts.length > 0 ? (
            <>
              <ProductFilters
                products={allProducts}
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
              <p className="text-muted-foreground">No products available.</p>
            </div>
          )}
        </div>
      </section>

      <Newsletter />
    </div>
  );
};

export default ShopAll;

