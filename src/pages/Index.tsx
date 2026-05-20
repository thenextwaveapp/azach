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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {featuredProducts.slice(0, 5).map((product) => (
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

      {/* Custom / Rework & Repair Introduction */}
      <section className="py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 uppercase">This is where your pieces evolve.</h2>
            <p className="text-xl text-muted-foreground mb-4">
              At AZACH, we work in two ways:
            </p>
            <p className="text-lg text-muted-foreground">
              We create new pieces with you (Custom)<br />
              Or we transform what you already have (Rework & Repair)
            </p>
            <p className="text-lg text-muted-foreground mt-6">
              Both are built around collaboration — the difference is where you're starting from.
            </p>
          </div>

          <div className="max-w-4xl mx-auto mb-12">
            <h3 className="text-2xl font-bold mb-8 text-center uppercase">Choose Your Path</h3>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <Link to="/bespoke" className="group">
                <div className="bg-white p-8 h-full hover:shadow-lg transition-shadow border-2 border-transparent hover:border-foreground">
                  <h4 className="text-2xl font-bold mb-4 uppercase">Custom (Bespoke)</h4>
                  <p className="text-lg font-medium mb-4">Start from an idea.</p>
                  <div className="text-sm text-muted-foreground space-y-2 mb-6">
                    <p><strong>This is for you if:</strong></p>
                    <p>• You want a completely new piece</p>
                    <p>• You have a vision, reference, or concept</p>
                    <p>• You want something made specifically for you</p>
                    <p className="mt-4 text-xs">Available worldwide.</p>
                  </div>
                  <span className="text-sm uppercase tracking-wider group-hover:text-secondary transition-colors">
                    Start Custom Request →
                  </span>
                </div>
              </Link>
              <Link to="/rework" className="group">
                <div className="bg-white p-8 h-full hover:shadow-lg transition-shadow border-2 border-transparent hover:border-foreground">
                  <h4 className="text-2xl font-bold mb-4 uppercase">Rework & Repair</h4>
                  <p className="text-lg font-medium mb-4">Start from what you already own.</p>
                  <div className="text-sm text-muted-foreground space-y-2 mb-6">
                    <p><strong>This is for you if:</strong></p>
                    <p>• You have denim you want to transform</p>
                    <p>• Your piece needs adjustment or redesign</p>
                    <p>• You want to give new life to what you wear</p>
                    <p className="mt-4 text-xs">Lagos, Nigeria only.</p>
                  </div>
                  <span className="text-sm uppercase tracking-wider group-hover:text-secondary transition-colors">
                    Start Rework Request →
                  </span>
                </div>
              </Link>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <Link to="/donate-garments" className="group block">
              <div className="bg-white p-8 hover:shadow-lg transition-shadow text-center">
                <h4 className="text-2xl font-bold mb-4 uppercase">Donate Garments</h4>
                <p className="text-muted-foreground mb-6">
                  Not everything needs to be thrown away. Your unused garments can still serve a purpose — either within the community or through our production process.
                </p>
                <span className="text-sm uppercase tracking-wider group-hover:text-secondary transition-colors">
                  Learn About Donations →
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* SHOP BY TYPE */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wide mb-12 text-center">Shop by Type</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <Link to="/shop-all?category=tops" className="relative aspect-square group overflow-hidden">
              <OptimizedImage
                src="https://imagizer.imageshack.com/img922/6348/RmDO6F.jpg"
                alt="Tops"
                aspectRatio="square"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                <span className="text-white text-xl font-bold uppercase tracking-wide">Tops</span>
              </div>
            </Link>
            <Link to="/shop-all?category=bottoms" className="relative aspect-square group overflow-hidden">
              <OptimizedImage
                src="https://imagizer.imageshack.com/img922/2820/P7UF2l.jpg"
                alt="Bottoms"
                aspectRatio="square"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                <span className="text-white text-xl font-bold uppercase tracking-wide">Bottoms</span>
              </div>
            </Link>
            <Link to="/shop-all?category=outerwear" className="relative aspect-square group overflow-hidden">
              <OptimizedImage
                src="https://imagizer.imageshack.com/img922/6348/RmDO6F.jpg"
                alt="Outerwear"
                aspectRatio="square"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                <span className="text-white text-xl font-bold uppercase tracking-wide">Outerwear</span>
              </div>
            </Link>
            <Link to="/shop-all?category=sets" className="relative aspect-square group overflow-hidden">
              <OptimizedImage
                src="https://imagizer.imageshack.com/img922/2820/P7UF2l.jpg"
                alt="Sets"
                aspectRatio="square"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                <span className="text-white text-xl font-bold uppercase tracking-wide">Sets</span>
              </div>
            </Link>
            <Link to="/shop-all?category=accessories" className="relative aspect-square group overflow-hidden">
              <OptimizedImage
                src="https://imagizer.imageshack.com/img922/6348/RmDO6F.jpg"
                alt="Accessories"
                aspectRatio="square"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                <span className="text-white text-xl font-bold uppercase tracking-wide">Accessories</span>
              </div>
            </Link>
            <Link to="/shop-all?category=hats" className="relative aspect-square group overflow-hidden">
              <OptimizedImage
                src="https://imagizer.imageshack.com/img922/2820/P7UF2l.jpg"
                alt="Hats"
                aspectRatio="square"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                <span className="text-white text-xl font-bold uppercase tracking-wide">Hats</span>
              </div>
            </Link>
            <Link to="/shop-all?category=bags" className="relative aspect-square group overflow-hidden">
              <OptimizedImage
                src="https://imagizer.imageshack.com/img922/6348/RmDO6F.jpg"
                alt="Bags"
                aspectRatio="square"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                <span className="text-white text-xl font-bold uppercase tracking-wide">Bags</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wide mb-16 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-foreground text-background flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold mb-3 uppercase">Choose Your Path</h3>
              <p className="text-muted-foreground">
                Browse our collection of one-of-one pieces, request a bespoke item, or bring in something to rework.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-foreground text-background flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold mb-3 uppercase">We Create</h3>
              <p className="text-muted-foreground">
                Our skilled team reconstructs, repairs, or crafts your piece using upcycled materials.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-foreground text-background flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold mb-3 uppercase">You Receive</h3>
              <p className="text-muted-foreground">
                Get your unique piece delivered, ready to wear and make a statement.
              </p>
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
