import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ProductCard } from "@/components/ProductCard";
import { Newsletter } from "@/components/Newsletter";
import { WelcomeModal } from "@/components/WelcomeModal";
import { GoldDivider } from "@/components/GoldDivider";
import { useFeaturedProducts } from "@/hooks/useProducts";
import { productToDisplay } from "@/utils/productHelpers";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const { data: featuredProducts = [], isLoading } = useFeaturedProducts();

  useEffect(() => {
    document.title = "AZACH - Sustainable Upcycled Fashion";
  }, []);

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
                <ProductCard key={product.id} {...productToDisplay(product)} product={product} />
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
            <Link to="/women" className="relative aspect-square overflow-hidden group cursor-pointer">
              <OptimizedImage
                src="https://imagizer.imageshack.com/img922/6348/RmDO6F.jpg"
                alt="Women's Collection"
                aspectRatio="square"
                className="h-full w-full object-cover object-bottom transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <div className="text-white text-center">
                  <h3 className="text-4xl font-bold mb-2 group-hover:scale-105 transition-transform">Women</h3>
                  <p className="text-base font-medium opacity-90 group-hover:opacity-100 group-hover:translate-y-[-4px] transition-all flex items-center justify-center gap-2">
                    Explore Collection
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </p>
                </div>
              </div>
            </Link>
            <Link to="/men" className="relative aspect-square overflow-hidden group cursor-pointer">
              <OptimizedImage
                src="https://imagizer.imageshack.com/img922/2820/P7UF2l.jpg"
                alt="Men's Collection"
                aspectRatio="square"
                className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <div className="text-white text-center">
                  <h3 className="text-4xl font-bold mb-2 group-hover:scale-105 transition-transform">Men</h3>
                  <p className="text-base font-medium opacity-90 group-hover:opacity-100 group-hover:translate-y-[-4px] transition-all flex items-center justify-center gap-2">
                    Explore Collection
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <Newsletter />

      <GoldDivider />

      {/* Footer */}
      <footer className="py-16 bg-black text-white">
        <div className="container mx-auto px-4">
          {/* Top Section - Logo and Social */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 pb-12 border-b border-gray-800">
            <Link 
              to="/" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="mb-6 md:mb-0"
            >
              <img src="/Azach-Logo.png" alt="AZACH" className="h-16 w-auto brightness-0 invert" />
            </Link>
            <div className="flex gap-6">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
                <img src="/instagram.png" alt="Instagram" className="h-6 w-6" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
                <img src="/facebook.png" alt="Facebook" className="h-6 w-6" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
                <img src="/x.png" alt="X" className="h-6 w-6" />
                <span className="sr-only">X</span>
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
                <img src="/tiktok.png" alt="TikTok" className="h-6 w-6" />
                <span className="sr-only">TikTok</span>
              </a>
              <a href="https://snapchat.com" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
                <img src="/snapchat.png" alt="Snapchat" className="h-6 w-6" />
                <span className="sr-only">Snapchat</span>
              </a>
            </div>
          </div>

          {/* Links Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-12">
            <div>
              <h4 className="font-semibold mb-4 text-white uppercase tracking-wider text-sm">Shop</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/shop-all" className="hover:text-white transition-colors">Shop All</Link></li>
                <li><Link to="/women" className="hover:text-white transition-colors">Women</Link></li>
                <li><Link to="/men" className="hover:text-white transition-colors">Men</Link></li>
                <li><Link to="/sale" className="hover:text-white transition-colors">Sale</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white uppercase tracking-wider text-sm">Help</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/customer-service" className="hover:text-white transition-colors">Customer Service</Link></li>
                <li><Link to="/returns" className="hover:text-white transition-colors">Returns</Link></li>
                <li><Link to="/size-guide" className="hover:text-white transition-colors">Size Guide</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white uppercase tracking-wider text-sm">Company</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/our-story" className="hover:text-white transition-colors">Our Story</Link></li>
                <li><Link to="/lookbook" className="hover:text-white transition-colors">Lookbook</Link></li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            <p>&copy; 2024 AZACH. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
