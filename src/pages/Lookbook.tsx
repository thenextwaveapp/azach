import { useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const lookbookImages = [

  {
    id: 2,
    url: 'https://imagizer.imageshack.com/img922/4573/t32bY4.png',
    title: 'Urban Style',
    subtitle: 'Street Ready',
  },
  {
    id: 3,
    url: 'https://imagizer.imageshack.com/img924/7503/WWQd4o.png',
    title: 'Bold Statements',
    subtitle: 'Stand Out',
  },
  {
    id: 4,
    url: 'https://imagizer.imageshack.com/img922/8977/njo2Cy.png',
    title: 'Everyday Essentials',
    subtitle: 'Effortless Style',
    productId: '1', // Link to product ID in your database
  },
  {
    id: 12,
    url: 'https://imagizer.imageshack.com/img922/3118/oLZTGy.png',
    title: 'Clean Lines',
    subtitle: 'Minimalist Appeal',
  },
  {
    id: 8,
    url: 'https://imagizer.imageshack.com/img923/6444/rVXa7Q.jpg',
    title: 'Statement Pieces',
    subtitle: 'Make an Impact',
  },
  {
    id: 11,
    url: 'https://imagizer.imageshack.com/img922/910/6btd6p.jpg',
    title: 'Refined Comfort',
    subtitle: 'Casual Luxury',
  },
 
  {
    id: 14,
    url: 'https://imagizer.imageshack.com/img922/9915/XoteCo.jpg',
    title: 'Denim Reimagined',
    subtitle: 'Circular Fashion',
  },
  {
    id: 16,
    url: 'https://imagizer.imageshack.com/img924/6849/LNz3AB.jpg',
    title: 'Street Culture',
    subtitle: 'Urban Expression',
  },
  {
    id: 13,
    url: 'https://imagizer.imageshack.com/img922/1637/rCT53r.jpg',
    title: 'Layered Looks',
    subtitle: 'Versatile Style',
  },
  {
    id: 20,
    url: 'https://imagizer.imageshack.com/img924/5903/Q3ouqG.jpg',
    title: 'Authentic Style',
    subtitle: 'True Character',
  },
  {
    id: 21,
    url: 'https://imagizer.imageshack.com/img922/1922/XC1h1T.jpg',
    title: 'Urban Uniform',
    subtitle: 'City Ready',
  },
  {
    id: 25,
    url: 'https://imagizer.imageshack.com/img923/658/8Spq9s.jpg',
    title: 'Timeless Appeal',
    subtitle: 'Enduring Style',
  },
  {
    id: 22,
    url: 'https://imagizer.imageshack.com/img922/2168/Vmedyk.jpg',
    title: 'Elevated Basics',
    subtitle: 'Premium Essentials',
  },
 

  {
    id: 26,
    url: 'https://imagizer.imageshack.com/img924/4527/sNTuHP.jpg',
    title: 'Refined Rebellion',
    subtitle: 'Sophisticated Edge',
  },
  {
    id: 23,
    url: 'https://imagizer.imageshack.com/img924/319/n7QIYV.jpg',
    title: 'Distinctive Details',
    subtitle: 'Crafted Quality',
  },
  {
    id: 24,
    url: 'https://imagizer.imageshack.com/img924/8522/6hDXOq.jpg',
    title: 'Contemporary Craft',
    subtitle: 'Modern Artisan',
  },
  {
    id: 27,
    url: 'https://imagizer.imageshack.com/img922/7715/ZQPBQo.jpg',
    title: 'Street Luxury',
    subtitle: 'Premium Casual',
  },
  {
    id: 29,
    url: 'https://imagizer.imageshack.com/img923/5811/wZiu50.jpg',
    title: 'Urban Aesthetic',
    subtitle: 'City Style',
  },

  {
    id: 5,
    url: 'https://imagizer.imageshack.com/img922/6203/Vs2iEj.jpg',
    title: 'Reimagined Classics',
    subtitle: 'Timeless Pieces',
  },
  {
    id: 6,
    url: 'https://imagizer.imageshack.com/img922/6506/jf1DmN.jpg',
    title: 'Crafted Details',
    subtitle: 'Artisan Quality',
  },
  {
    id: 7,
    url: 'https://imagizer.imageshack.com/img923/3149/EbT0og.jpg',
    title: 'Contemporary Edge',
    subtitle: 'Modern Design',
  },
  {
    id: 31,
    url: 'https://imagizer.imageshack.com/img922/5598/bz06Z2.jpg',
    title: 'Bold Expression',
    subtitle: 'Individual Style',
  },
  {
    id: 32,
    url: 'https://imagizer.imageshack.com/img924/8458/EM9pci.jpg',
    title: 'Modern Heritage',
    subtitle: 'Contemporary Roots',
  },
  {
    id: 35,
    url: 'https://imagizer.imageshack.com/img924/4269/cODp4B.jpg',
    title: 'Street Essential',
    subtitle: 'Urban Core',
  },
  {
    id: 37,
    url: 'https://imagizer.imageshack.com/img923/866/DEPaZH.jpg',
    title: 'Crafted Character',
    subtitle: 'Artisan Touch',
  },
  {
    id: 19,
    url: 'https://imagizer.imageshack.com/img922/6065/mIaSch.jpg',
    title: 'Bold Textures',
    subtitle: 'Tactile Design',
  },
  {
    id: 33,
    url: 'https://imagizer.imageshack.com/img924/2177/k7nEHz.jpg',
    title: 'Casual Sophistication',
    subtitle: 'Refined Ease',
  },

  {
    id: 36,
    url: 'https://imagizer.imageshack.com/img924/4707/ZEPFku.jpg',
    title: 'Elevated Everyday',
    subtitle: 'Premium Daily',
  },

  {
    id: 30,
    url: 'https://imagizer.imageshack.com/img924/1871/4AgN7k.jpg',
    title: 'Crafted Comfort',
    subtitle: 'Artisan Made',
  },
  
  {
    id: 28,
    url: 'https://imagizer.imageshack.com/img923/7982/SWpFtu.jpg',
    title: 'Heritage Renewed',
    subtitle: 'Classic Reimagined',
  },
  {
    id: 38,
    url: 'https://imagizer.imageshack.com/img923/4334/1sXp7a.jpg',
    title: 'Urban Elegance',
    subtitle: 'City Refined',
  },
  {
    id: 39,
    url: 'https://imagizer.imageshack.com/img923/782/j3G9Vf.jpg',
    title: 'Signature Craft',
    subtitle: 'Made to Last',
  },
  {
    id: 40,
    url: 'https://imagizer.imageshack.com/img922/8419/3yHXLe.jpg',
    title: 'Timeless Upcycle',
    subtitle: 'Sustainable Legacy',
  },
];

const Lookbook = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

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
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center bg-gradient-to-b from-black via-zinc-900 to-black">
        <div className="text-center space-y-6 px-4">
          <h1 className="text-7xl md:text-9xl font-bold tracking-tighter font-display text-white">
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
        {lookbookImages.map((image, index) => (
          <div
            key={image.id}
            className="lookbook-card h-screen flex items-center justify-center px-4"
            style={{
              marginBottom: index === lookbookImages.length - 1 ? '0' : '100vh',
            }}
          >
            <div className="relative w-full max-w-7xl" style={{ height: 'calc((100vh - 80px) * 0.85)' }}>
              <div className="group relative w-full h-full overflow-hidden rounded-3xl bg-muted border border-border/50">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent" />

                {/* Shop This Look Button - Only if productId exists */}
                {image.productId && (
                  <div className="absolute bottom-12 right-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      onClick={() => navigate(`/product/${image.productId}`)}
                      className="bg-white/95 text-black hover:bg-white backdrop-blur-sm gap-2 shadow-lg"
                      size="sm"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Shop This Look
                    </Button>
                  </div>
                )}

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-12 text-foreground">
                  <div className="space-y-2">
                    <p className="text-sm uppercase tracking-[0.3em] font-light text-muted-foreground">
                      {String(index + 1).padStart(2, '0')} / {String(lookbookImages.length).padStart(2, '0')}
                    </p>
                  </div>
                </div>

                {/* Decorative Corner Elements */}
                <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-foreground/20" />
                <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-foreground/20" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="relative h-screen flex items-center justify-center bg-gradient-to-b from-black via-zinc-900 to-black">
        <div className="text-center space-y-8 px-4">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white">
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
                navigate('/');
                window.scrollTo(0, 0);
              }}
              className="text-lg px-8 py-6 border-zinc-700 text-zinc-900 hover:bg-zinc-800 hover:text-white hover:border-zinc-600 transition-colors duration-300"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lookbook;
