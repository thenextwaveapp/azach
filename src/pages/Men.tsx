import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { Newsletter } from "@/components/Newsletter";
import { ProductFilters, SortOption } from "@/components/ProductFilters";
import { useFilteredProducts, useProducts } from "@/hooks/useProducts";
import { productToDisplay } from "@/utils/productHelpers";
import { useState, useEffect } from "react";

const Men = () => {
  const [filters, setFilters] = useState<{
    categories: string[];
    minPrice: number;
    maxPrice: number;
    inStock: boolean | null;
    onSale: boolean | null;
    gender: 'men' | 'women' | 'unisex' | null;
    genders: ('men' | 'women' | 'unisex')[];
    sortBy: SortOption;
  }>({
    categories: [],
    minPrice: 0,
    maxPrice: 10000,
    inStock: null,
    onSale: null,
    gender: null,
    genders: ['men', 'unisex'], // Filter for men and unisex
    sortBy: 'newest',
  });

  const { data: products = [], isLoading } = useFilteredProducts(filters);

  // Get all products for categories (we still need this for filter options)
  const { data: allProducts = [] } = useProducts();

  // Set page title
  useEffect(() => {
    document.title = "Men's Collection - AZACH";
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Men's Collection</h1>
            <p className="text-lg text-muted-foreground">
              Sophisticated and refined pieces for the modern gentleman
            </p>
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
            hideGenderFilter={true}
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

export default Men;

