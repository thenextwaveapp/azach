import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ProductCard } from "@/components/ProductCard";
import { Newsletter } from "@/components/Newsletter";
import { WelcomeModal } from "@/components/WelcomeModal";
import { useFeaturedProducts } from "@/hooks/useProducts";
import { productToDisplay } from "@/utils/productHelpers";
import { Link } from "react-router-dom";

const Index = () => {
  const { data: featuredProducts = [], isLoading } = useFeaturedProducts();

  return (
    <div className="min-h-screen">
      <WelcomeModal />
      <Header />
      <Hero />
      
      {/* Featured Collections */}
      <section className="py-24 bg-gradient-to-b from-[#f5f0e8] via-white to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">New Arrivals</h2>
            <p className="text-lg text-muted-foreground">
              Curated pieces for the season ahead
            </p>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} {...productToDisplay(product)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No featured products available.</p>
            </div>
          )}
        </div>
      </section>

      {/* Collections Grid */}
      <section className="py-24 bg-gradient-to-b from-white to-muted">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative aspect-square overflow-hidden group cursor-pointer">
              <img
                src="https://imagizer.imageshack.com/img922/6348/RmDO6F.jpg"
                alt="Women's Collection"
                className="h-full w-full object-cover object-bottom transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="text-white text-center">
                  <h3 className="text-4xl font-bold mb-2">Women</h3>
                  <p className="text-lg">Explore Collection</p>
                </div>
              </div>
            </div>
            <div className="relative aspect-square overflow-hidden group cursor-pointer">
              <img
                src="https://imagizer.imageshack.com/img922/2820/P7UF2l.jpg"
                alt="Men's Collection"
                className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="text-white text-center">
                  <h3 className="text-4xl font-bold mb-2">Men</h3>
                  <p className="text-lg">Explore Collection</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Newsletter />

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/new" className="hover:text-foreground transition-colors">New Arrivals</Link></li>
                <li><Link to="/women" className="hover:text-foreground transition-colors">Women</Link></li>
                <li><Link to="/men" className="hover:text-foreground transition-colors">Men</Link></li>
                <li><Link to="/sale" className="hover:text-foreground transition-colors">Sale</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Help</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/customer-service" className="hover:text-foreground transition-colors">Customer Service</Link></li>
                <li><Link to="/returns" className="hover:text-foreground transition-colors">Returns</Link></li>
                <li><Link to="/size-guide" className="hover:text-foreground transition-colors">Size Guide</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/our-story" className="hover:text-foreground transition-colors">Our Story</Link></li>
                <li><Link to="/lookbook" className="hover:text-foreground transition-colors">Lookbook</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Instagram</a></li>
                <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Facebook</a></li>
                <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Twitter</a></li>
                <li><a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Pinterest</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2024 AZACH. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
