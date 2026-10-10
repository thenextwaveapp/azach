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
import { useEffect, useState } from "react";

// Matches the grid's lg:grid-cols-5 breakpoint — below it (2-3 cols) a full page
// of 6 fills whole rows; at lg+ (5 cols) a page of 5 fills exactly one row.
const FEATURED_PAGE_SIZE_MOBILE = 6;
const FEATURED_PAGE_SIZE_DESKTOP = 5;

const Index = () => {
  const { data: featuredProducts = [], isLoading } = useFeaturedProducts();
  const [featuredPage, setFeaturedPage] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mql.matches);
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
      setFeaturedPage(0);
    };
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  const featuredPageSize = isDesktop ? FEATURED_PAGE_SIZE_DESKTOP : FEATURED_PAGE_SIZE_MOBILE;
  const featuredPageCount = Math.ceil(featuredProducts.length / featuredPageSize);
  const visibleFeaturedProducts = featuredProducts.slice(
    featuredPage * featuredPageSize,
    featuredPage * featuredPageSize + featuredPageSize
  );

  useEffect(() => {
    document.title = "AZACH - Sustainable Upcycled Fashion";
  }, []);

  return (
    <div className="min-h-screen">
      <WelcomeModal />
      <Header />
      <Hero />
      
      {/* NEW PIECES */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-semibold uppercase tracking-wide">New Pieces</h2>
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
                {visibleFeaturedProducts.map((product) => (
                  <ProductCard key={product.id} {...productToDisplay(product)} product={product} listName="New Pieces" />
                ))}
              </div>
              {/* Pagination Arrows */}
              {featuredPageCount > 1 && (
                <div className="flex gap-3 justify-end mt-6">
                  <button
                    onClick={() => setFeaturedPage((p) => Math.max(0, p - 1))}
                    disabled={featuredPage === 0}
                    className="w-10 h-10 rounded-full border-2 border-foreground flex items-center justify-center hover:bg-foreground hover:text-background transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-foreground"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setFeaturedPage((p) => Math.min(featuredPageCount - 1, p + 1))}
                    disabled={featuredPage >= featuredPageCount - 1}
                    className="w-10 h-10 rounded-full border-2 border-foreground flex items-center justify-center hover:bg-foreground hover:text-background transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-foreground"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No featured products available.</p>
            </div>
          )}
        </div>
      </section>

      {/* CAMPAIGN STRIP */}
      <section className="relative overflow-hidden text-white">
        {/* Collage of campaign images as the backdrop */}
        <div className="absolute inset-0 grid grid-cols-3 md:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <img
              key={n}
              src={`/campaign/strip-${n}.webp`}
              alt=""
              className={`h-full w-full object-cover object-top ${n > 3 ? "hidden md:block" : ""}`}
              loading="lazy"
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 container mx-auto px-4 py-20 md:py-24 text-center">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-[0.25em] uppercase">
            Reconstruction Into Refinement
          </h2>
          <p className="mt-4 text-sm md:text-base text-white/90">
            Different Pasts, A More Considered Future
          </p>
          <Link to="/lookbook" className="inline-block mt-8">
            <button className="bg-[#a97c50] hover:bg-[#8b6440] text-white px-8 py-3 text-sm uppercase tracking-wide font-semibold transition-colors">
              View the Collection
            </button>
          </Link>
        </div>
      </section>

      {/* SHOP BY TYPE */}
      <section className="py-8 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-semibold uppercase tracking-wide mb-6">Shop by Type</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <Link to="/shop-all?category=tops" className="group text-center">
              <div className="relative aspect-square mb-3 overflow-hidden">
                <OptimizedImage
                  src="/campaign/cat-tops.webp"
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
                  src="/campaign/cat-bottoms.webp"
                  alt="Bottoms"
                  aspectRatio="square"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ objectPosition: 'center 25%' }}
                  loading="lazy"
                />
              </div>
              <span className="text-sm font-medium uppercase tracking-wide">Bottoms</span>
            </Link>

            <Link to="/shop-all?category=sets" className="group text-center">
              <div className="relative aspect-square mb-3 overflow-hidden">
                <OptimizedImage
                  src="/campaign/cat-sets.webp"
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
                  src="/campaign/cat-accessories.webp"
                  alt="Accessories"
                  aspectRatio="square"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ objectPosition: 'center 12%' }}
                  loading="lazy"
                />
              </div>
              <span className="text-sm font-medium uppercase tracking-wide">Accessories</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Service Banners */}
      <section className="py-6 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Link to="/bespoke" className="group relative h-72 overflow-hidden">
              <OptimizedImage
                src="/campaign/banner-custom.webp"
                alt="Custom, Rework & Repair"
                aspectRatio="landscape"
                className="absolute inset-0 w-full h-full object-cover object-[center_62%] transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/70 transition-colors" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-white text-center">
                <h3 className="font-display text-3xl font-bold mb-2">MAKE IT YOURS</h3>
                <p className="text-xs uppercase tracking-[0.2em] mb-4">Custom + Rework & Repair</p>
                <p className="text-sm max-w-md">
                  Have an idea? Have something in your wardrobe that could become something more? Work with
                  AZACH to create, reconstruct, repair or reshape a piece.
                </p>
              </div>
            </Link>

            <Link to="/donate-garments" className="group relative h-72 overflow-hidden">
              <OptimizedImage
                src="/campaign/banner-donate.webp"
                alt="Garment Donation"
                aspectRatio="landscape"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/70 transition-colors" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-white text-center">
                <h3 className="font-display text-3xl font-bold mb-2">GIVE IT ANOTHER LIFE</h3>
                <p className="text-xs uppercase tracking-[0.2em] mb-4">Garment Donation</p>
                <p className="text-sm max-w-md">
                  Done with something you own? Give it to AZACH and help keep it in motion through reuse,
                  reconstruction or responsible next steps.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* THE AZACH LIFECYCLE */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold uppercase tracking-wide">How AZACH Keeps Things Moving</h2>
            <Link to="/our-story" className="text-sm uppercase tracking-wider hover:text-secondary transition-colors hidden md:block">
              Explore the Lifecycle →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10">
            {[
              {
                step: 1,
                title: "Create",
                copy: "Existing materials are transformed into pieces designed to be wanted, worn and lived in.",
              },
              {
                step: 2,
                title: "Wear",
                copy: "The piece becomes yours. You wear it, live in it, style it and give it a story of its own.",
              },
              {
                step: 3,
                title: "Return",
                copy: "When you're done, bring it back. Instead of letting it disappear, you can return your AZACH piece to give it another possibility.",
              },
              {
                step: 4,
                title: "Rework",
                copy: "We repair, alter, reconstruct or transform the piece based on what it needs and what it can become.",
              },
              {
                step: 5,
                title: "Reintroduce",
                copy: "The garment or its materials return to circulation as something ready to be worn, used or experienced again.",
              },
            ].map(({ step, title, copy }) => (
              <div key={step} className="text-center">
                <div className="w-14 h-14 rounded-full bg-foreground text-background flex items-center justify-center text-xl font-semibold mx-auto mb-4">
                  {step}
                </div>
                <h3 className="text-lg font-semibold mb-2 uppercase">{title}</h3>
                <p className="text-sm text-muted-foreground">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />

      <Footer />
    </div>
  );
};

export default Index;
