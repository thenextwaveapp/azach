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
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
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
            <div className="relative">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                {featuredProducts.slice(0, 5).map((product) => (
                  <ProductCard key={product.id} {...productToDisplay(product)} product={product} />
                ))}
              </div>
              {/* Pagination Arrows */}
              <div className="flex gap-3 justify-end mt-6">
                <button className="w-10 h-10 rounded-full border-2 border-foreground flex items-center justify-center hover:bg-foreground hover:text-background transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="w-10 h-10 rounded-full border-2 border-foreground flex items-center justify-center hover:bg-foreground hover:text-background transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No featured products available.</p>
            </div>
          )}
        </div>
      </section>

      {/* Three Service Cards */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <Link to="/bespoke" className="group relative h-64 overflow-hidden">
              <OptimizedImage
                src="https://imagizer.imageshack.com/img922/6348/RmDO6F.jpg"
                alt="Bespoke"
                aspectRatio="landscape"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/70 transition-colors" />
              <div className="absolute inset-0 flex flex-col justify-center p-8 text-white">
                <h3 className="text-2xl font-bold mb-3 uppercase">Bespoke</h3>
                <p className="text-sm mb-6 max-w-xs">Made for you. Work with our studio to create something personal.</p>
                <button className="border-2 border-white px-6 py-2 text-sm uppercase tracking-wide hover:bg-white hover:text-black transition-colors self-start flex items-center gap-2">
                  Learn More
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </Link>

            <Link to="/rework" className="group relative h-64 overflow-hidden">
              <OptimizedImage
                src="https://imagizer.imageshack.com/img922/2820/P7UF2l.jpg"
                alt="Rework & Repair"
                aspectRatio="landscape"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/70 transition-colors" />
              <div className="absolute inset-0 flex flex-col justify-center p-8 text-white">
                <h3 className="text-2xl font-bold mb-3 uppercase">Rework & Repair</h3>
                <p className="text-sm mb-6 max-w-xs">Give your pieces a second life.</p>
                <button className="border-2 border-white px-6 py-2 text-sm uppercase tracking-wide hover:bg-white hover:text-black transition-colors self-start flex items-center gap-2">
                  Learn More
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </Link>

            <Link to="/donate-garments" className="group relative h-64 overflow-hidden">
              <OptimizedImage
                src="https://imagizer.imageshack.com/img922/6348/RmDO6F.jpg"
                alt="Donate Garments"
                aspectRatio="landscape"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/70 transition-colors" />
              <div className="absolute inset-0 flex flex-col justify-center p-8 text-white">
                <h3 className="text-2xl font-bold mb-3 uppercase">Donate Garments</h3>
                <p className="text-sm mb-6 max-w-xs">Your old clothes can help someone else and the planet.</p>
                <button className="border-2 border-white px-6 py-2 text-sm uppercase tracking-wide hover:bg-white hover:text-black transition-colors self-start flex items-center gap-2">
                  Learn More
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* SHOP BY TYPE */}
      <section className="py-12 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wide mb-8">Shop by Type</h2>
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
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wide">How It Works</h2>
            <Link to="/our-story" className="text-sm uppercase tracking-wider hover:text-secondary transition-colors hidden md:block">
              View Process →
            </Link>
          </div>
          <div className="grid lg:grid-cols-[1fr,auto] gap-8 items-center">
            {/* Steps - Horizontal */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

            {/* Image - Wide Rectangle */}
            <div className="hidden lg:block w-96">
              <div className="aspect-[4/3] overflow-hidden">
                <OptimizedImage
                  src="https://imagizer.imageshack.com/img922/6348/RmDO6F.jpg"
                  alt="How AZACH Works"
                  aspectRatio="landscape"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
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
