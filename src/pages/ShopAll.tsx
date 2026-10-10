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

  const { getPrice, currency } = useCurrency();

  // Excludes minPrice/maxPrice — the server-side query no longer filters on price (see
  // productService.getFiltered), and including them here would change the react-query key
  // on every currency-rate tick, triggering a needless refetch of the whole product list.
  const serverFilters = useMemo(
    () => ({
      categories: filters.categories,
      inStock: filters.inStock,
      onSale: filters.onSale,
      gender: filters.gender,
      sortBy: filters.sortBy,
    }),
    [filters.categories, filters.inStock, filters.onSale, filters.gender, filters.sortBy]
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

  useTrackItemList("Shop All", products, getPrice, currency, isLoading);

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
            backgroundImage: 'url(/campaign/hero-store.jpg)',
            backgroundPosition: 'center 55%'
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-slate-900/35" />

        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="text-center">
            <h1 className="font-display text-5xl md:text-6xl font-bold uppercase text-white"
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
            >
              Find Your Piece
            </h1>
            <h2 className="text-xl md:text-2xl font-light uppercase tracking-wide mt-4 text-white">
              Contemporary pieces made from what already exists
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
            maxPrice={allProducts.length > 0 ? Math.max(...allProducts.map(p => getDisplayPriceAmount(p, getPrice))) : 1000}
          />

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} {...productToDisplay(product)} product={product} listName="Shop All" />
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

export default ShopAll;

