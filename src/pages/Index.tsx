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
            <Link to="/women" className="relative aspect-square overflow-hidden group cursor-pointer">
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
            </Link>
            <Link to="/men" className="relative aspect-square overflow-hidden group cursor-pointer">
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
            </Link>
          </div>
        </div>
      </section>

      <Newsletter />

      {/* Footer */}
      <footer className="py-12 bg-black text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4 text-white">Shop</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/new" className="hover:text-white transition-colors">New Arrivals</Link></li>
                <li><Link to="/women" className="hover:text-white transition-colors">Women</Link></li>
                <li><Link to="/men" className="hover:text-white transition-colors">Men</Link></li>
                <li><Link to="/sale" className="hover:text-white transition-colors">Sale</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Help</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/customer-service" className="hover:text-white transition-colors">Customer Service</Link></li>
                <li><Link to="/returns" className="hover:text-white transition-colors">Returns</Link></li>
                <li><Link to="/size-guide" className="hover:text-white transition-colors">Size Guide</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/our-story" className="hover:text-white transition-colors">Our Story</Link></li>
                <li><Link to="/lookbook" className="hover:text-white transition-colors">Lookbook</Link></li>
              </ul>
            </div>
            <div className="flex flex-col">
              <Link to="/" className="mb-4">
                <img src="/Azach-Logo.png" alt="AZACH" className="h-12 w-auto brightness-0 invert" />
              </Link>
              <div className="flex gap-4 mt-auto">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                  <span className="sr-only">Instagram</span>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                  <span className="sr-only">Facebook</span>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="sr-only">X</span>
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                  <span className="sr-only">TikTok</span>
                </a>
                <a href="https://snapchat.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.065 2c1.436 0 2.698.366 3.761 1.098a6.807 6.807 0 012.465 2.975c.547 1.173.823 2.449.823 3.827 0 .943-.13 1.861-.39 2.753a9.448 9.448 0 01-1.108 2.508c-.481.77-1.041 1.473-1.682 2.11-.64.636-1.313 1.177-2.018 1.62-.705.445-1.415.786-2.13 1.025-.714.239-1.402.358-2.065.358-.663 0-1.35-.12-2.065-.358-.714-.239-1.424-.58-2.13-1.025-.705-.443-1.377-.984-2.017-1.62-.641-.637-1.201-1.34-1.682-2.11a9.448 9.448 0 01-1.108-2.508A8.813 8.813 0 01.33 9.9c0-1.378.276-2.654.823-3.827A6.807 6.807 0 013.618 3.098C4.681 2.366 5.943 2 7.379 2h4.686zm-.131 1.391H7.51c-1.204 0-2.202.297-2.994.892a5.416 5.416 0 00-1.96 2.368c-.436.938-.654 1.954-.654 3.049 0 .75.104 1.483.312 2.194.208.712.5 1.386.878 2.023.378.636.818 1.225 1.32 1.768.501.543 1.029 1.006 1.582 1.39.554.384 1.109.681 1.666.89.557.21 1.08.315 1.568.315.488 0 1.011-.105 1.568-.315.557-.209 1.112-.506 1.666-.89.553-.384 1.08-.847 1.582-1.39.502-.543.942-1.132 1.32-1.768.378-.637.67-1.311.878-2.023a7.422 7.422 0 00.312-2.194c0-1.095-.218-2.111-.654-3.049a5.416 5.416 0 00-1.96-2.368c-.792-.595-1.79-.892-2.994-.892z"/>
                  </svg>
                  <span className="sr-only">Snapchat</span>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            <p>&copy; 2024 AZACH. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
