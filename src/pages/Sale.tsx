import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Newsletter } from "@/components/Newsletter";
import { ProductFilters, SortOption } from "@/components/ProductFilters";
import { Badge } from "@/components/ui/badge";
import { useFilteredProducts, useProducts } from "@/hooks/useProducts";
import { productToDisplay, getDisplayPriceAmount } from "@/utils/productHelpers";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTrackItemList } from "@/hooks/useTrackItemList";
import { useState, useEffect, useMemo } from "react";

const Sale = () => {
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
    onSale: true, // Pre-filter for sale items
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

  useTrackItemList("Sale", products, getPrice, currency, isLoading);

  // Set page title
  useEffect(() => {
    document.title = "Sale - AZACH";
  }, []);

  const calculateDiscount = (price: number, originalPrice: number) => {
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-semibold mb-4">Sale</h1>
            <p className="text-lg text-muted-foreground">
              Limited time offers on selected items
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
            maxPrice={allProducts.length > 0 ? Math.max(...allProducts.map(p => getDisplayPriceAmount(p, getPrice))) : 1000}
          />

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
              {products.map((product) => {
                if (!product.original_price) return null;
                const discount = calculateDiscount(product.price, product.original_price);
                const productDisplay = productToDisplay(product);
                return (
                  <div key={product.id} className="relative">
                    <Badge className="absolute top-4 right-4 z-10 bg-secondary text-secondary-foreground">
                      {discount}% OFF
                    </Badge>
                    <ProductCard {...productDisplay} product={product} listName="Sale" />
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-lg font-semibold">${product.price}</span>
                      <span className="text-sm text-muted-foreground line-through">
                        ${product.original_price}
                      </span>
                    </div>
                  </div>
                );
              })}
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

export default Sale;

