import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Newsletter } from "@/components/Newsletter";
import { ProductFilters, SortOption } from "@/components/ProductFilters";
import { useFilteredProducts, useProducts } from "@/hooks/useProducts";
import { productToDisplay, getDisplayPriceAmount } from "@/utils/productHelpers";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTrackItemList } from "@/hooks/useTrackItemList";
import { useState, useEffect, useMemo } from "react";

const Men = () => {
  const [filters, setFilters] = useState<{
    categories: string[];
    minPrice: number;
    maxPrice: number;
    inStock: boolean | null;
    onSale: boolean | null;
    genders: ('men' | 'women' | 'unisex')[];
    sortBy: SortOption;
  }>({
    categories: [],
    minPrice: 0,
    maxPrice: 10000,
    inStock: null,
    onSale: null,
    genders: ['men', 'unisex'], // Filter for men and unisex
    sortBy: 'newest',
  });

  // ProductFilters' gender buttons are hidden here (hideGenderFilter) and it always sends
  // a full replacement object on every change (including on mount) — merging instead of
  // replacing is what keeps the men+unisex preset above from being wiped out immediately.
  const handleFiltersChange = (partial: {
    categories: string[];
    minPrice: number;
    maxPrice: number;
    inStock: boolean | null;
    onSale: boolean | null;
    gender: 'men' | 'women' | 'unisex' | null;
    sortBy: SortOption;
  }) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const { getPrice, currency } = useCurrency();

  // Excludes minPrice/maxPrice — the server-side query no longer filters on price (see
  // productService.getFiltered), and including them here would change the react-query key
  // on every currency-rate tick, triggering a needless refetch of the whole product list.
  const serverFilters = useMemo(
    () => ({
      categories: filters.categories,
      inStock: filters.inStock,
      onSale: filters.onSale,
      genders: filters.genders,
      sortBy: filters.sortBy,
    }),
    [filters.categories, filters.inStock, filters.onSale, filters.genders, filters.sortBy]
  );
  const { data: unfilteredByPrice = [], isLoading } = useFilteredProducts(serverFilters);

  // Price filtering happens client-side against each product's actual displayed price —
  // see getDisplayPriceAmount for why that can't be a straight NGN column comparison.
  const products = useMemo(
    () =>
      unfilteredByPrice.filter((p) => {
        const amount = getDisplayPriceAmount(p, getPrice);
        return amount >= filters.minPrice && amount <= filters.maxPrice;
      }),
    [unfilteredByPrice, filters.minPrice, filters.maxPrice, getPrice]
  );

  // Get all products for categories (we still need this for filter options)
  const { data: allProducts = [] } = useProducts();

  useTrackItemList("Men", products, getPrice, currency, isLoading);

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
            <h1 className="text-5xl md:text-6xl font-semibold mb-4">Men's Collection</h1>
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
            onFiltersChange={handleFiltersChange}
            availableCategories={Array.from(new Set(allProducts.map(p => p.category)))}
            maxPrice={allProducts.length > 0 ? Math.max(...allProducts.map(p => getDisplayPriceAmount(p, getPrice))) : 1000}
            hideGenderFilter={true}
          />

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} {...productToDisplay(product)} product={product} listName="Men" />
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
      <Footer />
    </div>
  );
};

export default Men;

