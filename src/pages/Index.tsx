import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ProductCard } from "@/components/ProductCard";
import { Newsletter } from "@/components/Newsletter";
import { WelcomeModal } from "@/components/WelcomeModal";
import { Footer } from "@/components/Footer";
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
      
      {/* NEW PIECES */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wide">New Pieces</h2>
            <Link to="/shop-all" className="text-sm uppercase tracking-wider hover:text-secondary transition-colors">
              View All →
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
              {featuredProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex-shrink-0 w-64">
                  <ProductCard {...productToDisplay(product)} product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No featured products available.</p>
            </div>
          )}
        </div>
      </section>

      {/* Three Service Cards */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Link to="/bespoke" className="group relative h-80 overflow-hidden">
              <OptimizedImage
                src="https://imagizer.imageshack.com/img922/6348/RmDO6F.jpg"
                alt="Bespoke"
                aspectRatio="portrait"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/70 transition-colors" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-white">
                <h3 className="text-2xl font-bold mb-4 uppercase">Bespoke</h3>
                <p className="text-sm mb-6">Made for you. Work with our studio to create something personal.</p>
                <button className="border-2 border-white px-6 py-2 text-sm uppercase tracking-wide hover:bg-white hover:text-black transition-colors">
                  Learn More
                </button>
              </div>
            </Link>

            <Link to="/rework" className="group relative h-80 overflow-hidden">
              <OptimizedImage
                src="https://imagizer.imageshack.com/img922/2820/P7UF2l.jpg"
                alt="Rework & Repair"
                aspectRatio="portrait"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/70 transition-colors" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-white">
                <h3 className="text-2xl font-bold mb-4 uppercase">Rework & Repair</h3>
                <p className="text-sm mb-6">Give your pieces a second life.</p>
                <button className="border-2 border-white px-6 py-2 text-sm uppercase tracking-wide hover:bg-white hover:text-black transition-colors">
                  Learn More
                </button>
              </div>
            </Link>

            <Link to="/donate-garments" className="group relative h-80 overflow-hidden">
              <OptimizedImage
                src="https://imagizer.imageshack.com/img922/6348/RmDO6F.jpg"
                alt="Donate Garments"
                aspectRatio="portrait"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/70 transition-colors" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-white">
                <h3 className="text-2xl font-bold mb-4 uppercase">Donate Garments</h3>
                <p className="text-sm mb-6">Your old clothes can help someone else and the planet.</p>
                <button className="border-2 border-white px-6 py-2 text-sm uppercase tracking-wide hover:bg-white hover:text-black transition-colors">
                  Learn More
                </button>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* SHOP BY TYPE */}
      <section className="py-24 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wide mb-12 text-center">Shop by Type</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 max-w-7xl mx-auto">
            <Link to="/shop-all?category=tops" className="group text-center">
              <div className="relative aspect-square mb-3 overflow-hidden">
                <OptimizedImage
                  src="https://imagizer.imageshack.com/img922/6348/RmDO6F.jpg"
                  alt="Tops"
                  aspectRatio="square"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <span className="text-sm font-medium uppercase tracking-wide">Tops</span>
            </Link>

            <Link to="/shop-all?category=bottoms" className="group text-center">
              <div className="relative aspect-square mb-3 overflow-hidden">
                <OptimizedImage
                  src="https://imagizer.imageshack.com/img922/2820/P7UF2l.jpg"
                  alt="Bottoms"
                  aspectRatio="square"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <span className="text-sm font-medium uppercase tracking-wide">Bottoms</span>
            </Link>

            <Link to="/shop-all?category=outerwear" className="group text-center">
              <div className="relative aspect-square mb-3 overflow-hidden">
                <OptimizedImage
                  src="https://imagizer.imageshack.com/img922/6348/RmDO6F.jpg"
                  alt="Outerwear"
                  aspectRatio="square"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <span className="text-sm font-medium uppercase tracking-wide">Outerwear</span>
            </Link>

            <Link to="/shop-all?category=sets" className="group text-center">
              <div className="relative aspect-square mb-3 overflow-hidden">
                <OptimizedImage
                  src="https://imagizer.imageshack.com/img922/2820/P7UF2l.jpg"
                  alt="Sets"
                  aspectRatio="square"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <span className="text-sm font-medium uppercase tracking-wide">Sets</span>
            </Link>

            <Link to="/shop-all?category=accessories" className="group text-center">
              <div className="relative aspect-square mb-3 overflow-hidden">
                <OptimizedImage
                  src="https://imagizer.imageshack.com/img922/6348/RmDO6F.jpg"
                  alt="Accessories"
                  aspectRatio="square"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <span className="text-sm font-medium uppercase tracking-wide">Accessories</span>
            </Link>

            <Link to="/shop-all?category=hats" className="group text-center">
              <div className="relative aspect-square mb-3 overflow-hidden">
                <OptimizedImage
                  src="https://imagizer.imageshack.com/img922/2820/P7UF2l.jpg"
                  alt="Hats"
                  aspectRatio="square"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <span className="text-sm font-medium uppercase tracking-wide">Hats</span>
            </Link>

            <Link to="/shop-all?category=keychains" className="group text-center">
              <div className="relative aspect-square mb-3 overflow-hidden">
                <OptimizedImage
                  src="https://imagizer.imageshack.com/img922/6348/RmDO6F.jpg"
                  alt="Keychains"
                  aspectRatio="square"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <span className="text-sm font-medium uppercase tracking-wide">Keychains</span>
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wide">How It Works</h2>
            <Link to="/our-story" className="text-sm uppercase tracking-wider hover:text-secondary transition-colors hidden md:block">
              View Process →
            </Link>
          </div>
          <div className="flex gap-8 items-start max-w-7xl mx-auto">
            {/* Steps - Horizontal */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-foreground text-background flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-lg font-bold mb-2 uppercase">Choose Your Path</h3>
                <p className="text-sm text-muted-foreground">
                  Browse our collection, request a bespoke item, or bring in something to rework.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-foreground text-background flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-lg font-bold mb-2 uppercase">We Create</h3>
                <p className="text-sm text-muted-foreground">
                  Our skilled team reconstructs, repairs, or crafts your piece using upcycled materials.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-foreground text-background flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-lg font-bold mb-2 uppercase">You Receive</h3>
                <p className="text-sm text-muted-foreground">
                  Get your unique piece delivered, ready to wear and make a statement.
                </p>
              </div>
            </div>

            {/* Image - Rectangle same height */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <OptimizedImage
                src="https://imagizer.imageshack.com/img922/6348/RmDO6F.jpg"
                alt="How AZACH Works"
                aspectRatio="portrait"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      <Newsletter />

      <Footer />
    </div>
  );
};

export default Index;
