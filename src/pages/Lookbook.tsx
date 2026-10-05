import { useEffect, useRef, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ShoppingBag, MessageSquarePlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLookbookImages } from '@/hooks/useLookbook';

const Lookbook = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: lookbookImages = [] } = useLookbookImages();
  const [openCaptions, setOpenCaptions] = useState<Set<string>>(new Set());

  const toggleCaption = (id: string) => {
    setOpenCaptions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    // Fallback so any edge-case horizontal overscroll reveals black, not the site's
    // usual light body background, behind this page specifically.
    const previousBodyBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#000';
    return () => {
      document.body.style.backgroundColor = previousBodyBg;
    };
  }, []);

  useEffect(() => {
    // Set page title
    document.title = "Lookbook - AZACH";

    const handleScroll = () => {
      if (!containerRef.current) return;

      const cards = containerRef.current.querySelectorAll('.lookbook-card');
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;

      cards.forEach((card, index) => {
        const element = card as HTMLElement;
        const cardTop = element.offsetTop;
        const cardHeight = element.offsetHeight;

        // Calculate progress through this card
        const startProgress = cardTop - windowHeight;
        const endProgress = cardTop + cardHeight;
        const progress = (scrollPosition - startProgress) / (endProgress - startProgress);
        const clampedProgress = Math.max(0, Math.min(1, progress));

        // Sticky effect - each card sticks until the next one comes
        if (scrollPosition >= cardTop - windowHeight / 3 && scrollPosition < cardTop + cardHeight) {
          element.style.position = 'sticky';
          element.style.top = '10px';
        }

        // Scale and opacity effects
        const scale = 0.85 + (clampedProgress * 0.15);
        const opacity = 0.3 + (clampedProgress * 0.7);

        // Apply transforms
        element.style.transform = `scale(${scale})`;
        element.style.opacity = `${opacity}`;
        element.style.zIndex = `${index}`;
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, [lookbookImages.length]);

  return (
    <div className="min-h-screen bg-black overflow-x-clip">
      <Header />

      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center bg-gradient-to-b from-black via-zinc-900 to-black">
        <div className="text-center space-y-6 px-4">
          <h1 className="text-7xl md:text-9xl font-semibold tracking-tighter font-display text-white">
            LOOKBOOK
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto">
            Explore our latest collection through a curated visual journey
          </p>
          <div className="flex flex-col items-center gap-2 pt-8">
            <p className="text-sm text-zinc-400">Scroll to explore</p>
            <div className="animate-bounce text-white">
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Lookbook Cards */}
      <div ref={containerRef} className="relative bg-black">
        {lookbookImages.map((image, index) => {
          const showCaption = openCaptions.has(image.id);

          return (
            <div
              key={image.id}
              className="lookbook-card h-screen flex items-center justify-center px-2 md:px-6"
              style={{
                marginBottom: index === lookbookImages.length - 1 ? '0' : '100vh',
              }}
            >
              <div
                className="group relative w-full max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-800 to-zinc-950"
                style={{ height: 'calc(100vh - 20px)' }}
              >
                <img
                  src={image.image_url}
                  alt={image.headline || 'AZACH Lookbook'}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />

                {/* Shop This Look / Request This Look - bottom right, stacked if both exist */}
                <div className="absolute bottom-6 right-6 z-10 flex flex-col items-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {image.product_id && (
                    <Button
                      onClick={() => navigate(`/product/${image.product_id}`)}
                      className="bg-white/95 text-black hover:bg-white backdrop-blur-sm gap-2 shadow-lg"
                      size="sm"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Shop This Look
                    </Button>
                  )}

                  {image.headline && (
                    <Button
                      onClick={() =>
                        navigate('/bespoke', {
                          state: { referenceImageUrl: image.image_url, referenceHeadline: image.headline },
                        })
                      }
                      className="bg-white/15 text-white border border-white/40 hover:bg-white hover:text-black backdrop-blur-sm gap-2"
                      size="sm"
                    >
                      <MessageSquarePlus className="h-4 w-4" />
                      Request This Look
                    </Button>
                  )}
                </div>

                {/* Headline + optional caption - only rendered when data exists */}
                {image.headline && (
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/70 via-black/10 to-transparent flex flex-col justify-end p-6 md:p-10 pointer-events-none">
                    <div className="pointer-events-auto max-w-xl">
                      <h3 className="text-white text-2xl md:text-4xl font-semibold tracking-tight mb-3">
                        {image.headline}
                      </h3>
                      {image.caption && (
                        <>
                          {showCaption && (
                            <p className="text-white/90 text-sm md:text-base leading-relaxed mb-2 max-w-md">
                              {image.caption}
                            </p>
                          )}
                          <button
                            onClick={() => toggleCaption(image.id)}
                            className="text-[11px] uppercase tracking-[0.15em] text-white/70 hover:text-white underline underline-offset-4 decoration-white/40 hover:decoration-white transition-colors"
                          >
                            {showCaption ? 'Show Less' : 'Read More'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div className="relative h-screen flex items-center justify-center bg-gradient-to-b from-black via-zinc-900 to-black">
        <div className="text-center space-y-8 px-4">
          <h2 className="text-5xl md:text-7xl font-semibold tracking-tighter text-white">
            Ready to Shop?
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Explore our full collection and find your perfect style
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              size="lg"
              onClick={() => navigate('/bespoke')}
              className="text-lg px-8 py-6 bg-gradient-to-r from-[#a97c50] via-[#c4976d] to-[#a97c50] bg-[length:200%_100%] border-0 text-white hover:bg-[position:100%_0] transition-all duration-700 ease-out hover:scale-110 hover:-translate-y-1 shadow-lg hover:shadow-[0_20px_50px_rgba(169,124,80,0.4)]"
            >
              Bespoke Orders
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                navigate('/shop-all');
                window.scrollTo(0, 0);
              }}
              className="text-lg px-8 py-6 border-zinc-700 text-zinc-900 hover:bg-zinc-800 hover:text-white hover:border-zinc-600 transition-colors duration-300"
            >
              Shop All
            </Button>
          </div>
        </div>
      </div>
      <Footer dark />
    </div>
  );
};

export default Lookbook;
