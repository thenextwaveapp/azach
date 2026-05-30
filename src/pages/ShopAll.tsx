import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { Newsletter } from "@/components/Newsletter";
import { ProductFilters, SortOption } from "@/components/ProductFilters";
import { useFilteredProducts, useProducts } from "@/hooks/useProducts";
import { productToDisplay } from "@/utils/productHelpers";
import { useState, useEffect } from "react";

const ShopAll = () => {
  const [filters, setFilters] = useState<{
    categories: string[];
    minPrice: number;
    maxPrice: number;
    inStock: boolean | null;
    onSale: boolean | null;
    gender: 'men' | 'women' | 'unisex' | null;
    sortBy: SortOption;
  }>({
    categories: [],
    minPrice: 0,
    maxPrice: 10000,
    inStock: null,
    onSale: null,
    gender: null,
    sortBy: 'newest',
  });

  const { data: products = [], isLoading } = useFilteredProducts(filters);

  // Get all products for categories (we still need this for filter options)
  const { data: allProducts = [] } = useProducts();

  // Set page title
  useEffect(() => {
    document.title = "Shop All - AZACH";
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-[400px] flex items-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-no-repeat"
          style={{
            backgroundImage: 'url(/header-shop.png)',
            backgroundPosition: 'center 15%'
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-slate-900/35" />

        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-semibold text-white"
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
            >
              The Collection
            </h1>
            <h2 className="text-2xl md:text-3xl font-light mt-4 text-white">
              Discover Our Complete Range
            </h2>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <ProductFilters
            onFiltersChange={setFilters}
            availableCategories={Array.from(new Set(allProducts.map(p => p.category)))}
            maxPrice={allProducts.length > 0 ? Math.max(...allProducts.map(p => p.price)) : 1000}
          />

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} {...productToDisplay(product)} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products match your filters.</p>
            </div>
          )}
        </div>
      </section>

      <Newsletter />
    </div>
  );
};

export default ShopAll;

