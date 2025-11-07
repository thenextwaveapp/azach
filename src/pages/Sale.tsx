import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { Newsletter } from "@/components/Newsletter";
import { Badge } from "@/components/ui/badge";
import { useSaleProducts } from "@/hooks/useProducts";
import { productToDisplay } from "@/utils/productHelpers";

const Sale = () => {
  const { data: saleProducts = [], isLoading } = useSaleProducts();

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
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Sale</h1>
            <p className="text-lg text-muted-foreground">
              Limited time offers on selected items
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
          ) : saleProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {saleProducts.map((product) => {
                if (!product.original_price) return null;
                const discount = calculateDiscount(product.price, product.original_price);
                const productDisplay = productToDisplay(product);
                return (
                  <div key={product.id} className="relative">
                    <Badge className="absolute top-4 right-4 z-10 bg-secondary text-secondary-foreground">
                      {discount}% OFF
                    </Badge>
                    <ProductCard {...productDisplay} />
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
              <p className="text-muted-foreground">No sale products available.</p>
            </div>
          )}
        </div>
      </section>

      <Newsletter />
    </div>
  );
};

export default Sale;

