import { useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const lookbookImages = [
  {
    id: 1,
    url: 'https://imagizer.imageshack.com/img923/7589/84m8Yd.jpg',
    title: 'Upcycled Denim',
    subtitle: 'Sustainable Fashion',
  },
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
    id: 8,
    url: 'https://imagizer.imageshack.com/img923/6444/rVXa7Q.jpg',
    title: 'Statement Pieces',
    subtitle: 'Make an Impact',
  },
  {
    id: 9,
    url: 'https://imagizer.imageshack.com/img924/489/Mrc5xd.jpg',
    title: 'Vintage Revival',
    subtitle: 'Renewed Style',
  },
  {
    id: 10,
    url: 'https://imagizer.imageshack.com/img924/9480/cnwkS8.jpg',
    title: 'Urban Heritage',
    subtitle: 'City Culture',
  },
  {
    id: 11,
    url: 'https://imagizer.imageshack.com/img922/910/6btd6p.jpg',
    title: 'Refined Comfort',
    subtitle: 'Casual Luxury',
  },
  {
    id: 12,
    url: 'https://imagizer.imageshack.com/img922/3118/oLZTGy.png',
    title: 'Clean Lines',
    subtitle: 'Minimalist Appeal',
  },
  {
    id: 13,
    url: 'https://imagizer.imageshack.com/img922/1637/rCT53r.jpg',
    title: 'Layered Looks',
    subtitle: 'Versatile Style',
  },
  {
    id: 14,
    url: 'https://imagizer.imageshack.com/img922/9915/XoteCo.jpg',
    title: 'Denim Reimagined',
    subtitle: 'Circular Fashion',
  },
  {
    id: 15,
    url: 'https://imagizer.imageshack.com/img923/6829/agFCny.jpg',
    title: 'Signature Style',
    subtitle: 'Unique Identity',
  },
  {
    id: 16,
    url: 'https://imagizer.imageshack.com/img924/6849/LNz3AB.jpg',
    title: 'Street Culture',
    subtitle: 'Urban Expression',
  },
  {
    id: 17,
    url: 'https://imagizer.imageshack.com/img923/3397/WP8m6N.jpg',
    title: 'Modern Classics',
    subtitle: 'Reinvented',
  },
  {
    id: 18,
    url: 'https://imagizer.imageshack.com/img923/4766/7pWRgx.jpg',
    title: 'Casual Edge',
    subtitle: 'Effortless Cool',
  },
  {
    id: 19,
    url: 'https://imagizer.imageshack.com/img922/6065/mIaSch.jpg',
    title: 'Bold Textures',
    subtitle: 'Tactile Design',
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
    id: 22,
    url: 'https://imagizer.imageshack.com/img922/2168/Vmedyk.jpg',
    title: 'Elevated Basics',
    subtitle: 'Premium Essentials',
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
    id: 25,
    url: 'https://imagizer.imageshack.com/img923/658/8Spq9s.jpg',
    title: 'Timeless Appeal',
    subtitle: 'Enduring Style',
  },
  {
    id: 26,
    url: 'https://imagizer.imageshack.com/img924/4527/sNTuHP.jpg',
    title: 'Refined Rebellion',
    subtitle: 'Sophisticated Edge',
  },
  {
    id: 27,
    url: 'https://imagizer.imageshack.com/img922/7715/ZQPBQo.jpg',
    title: 'Street Luxury',
    subtitle: 'Premium Casual',
  },
  {
    id: 28,
    url: 'https://imagizer.imageshack.com/img923/7982/SWpFtu.jpg',
    title: 'Heritage Renewed',
    subtitle: 'Classic Reimagined',
  },
  {
    id: 29,
    url: 'https://imagizer.imageshack.com/img923/5811/wZiu50.jpg',
    title: 'Urban Aesthetic',
    subtitle: 'City Style',
  },
  {
    id: 30,
    url: 'https://imagizer.imageshack.com/img924/1871/4AgN7k.jpg',
    title: 'Crafted Comfort',
    subtitle: 'Artisan Made',
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
    id: 33,
    url: 'https://imagizer.imageshack.com/img924/2177/k7nEHz.jpg',
    title: 'Casual Sophistication',
    subtitle: 'Refined Ease',
  },
  {
    id: 34,
    url: 'https://imagizer.imageshack.com/img923/2982/9otzyr.jpg',
    title: 'Distinctive Denim',
    subtitle: 'Unique Pieces',
  },
  {
    id: 35,
    url: 'https://imagizer.imageshack.com/img924/4269/cODp4B.jpg',
    title: 'Street Essential',
    subtitle: 'Urban Core',
  },
  {
    id: 36,
    url: 'https://imagizer.imageshack.com/img924/4707/ZEPFku.jpg',
    title: 'Elevated Everyday',
    subtitle: 'Premium Daily',
  },
  {
    id: 37,
    url: 'https://imagizer.imageshack.com/img923/866/DEPaZH.jpg',
    title: 'Crafted Character',
    subtitle: 'Artisan Touch',
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
      <div className="relative h-screen flex items-center justify-center bg-black">
        <div className="absolute top-24 left-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="text-center space-y-6 px-4">
          <h1 className="text-7xl md:text-9xl font-bold tracking-tighter font-display text-white">
            LOOKBOOK
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
            Explore our latest collection through a curated visual journey
          </p>
          <div className="flex flex-col items-center gap-2 pt-8">
            <p className="text-sm text-gray-400">Scroll to explore</p>
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
      <div ref={containerRef} className="relative">
        {lookbookImages.map((image, index) => (
          <div
            key={image.id}
            className="lookbook-card h-screen flex items-center justify-center px-4"
            style={{
              marginBottom: index === lookbookImages.length - 1 ? '0' : '100vh',
            }}
          >
            <div className="relative w-full max-w-7xl" style={{ height: 'calc((100vh - 80px) * 0.85)' }}>
              <div className="relative w-full h-full overflow-hidden rounded-3xl bg-zinc-900" style={{ boxShadow: '0 0 60px 20px rgba(0, 0, 0, 0.3)' }}>
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
                  <div className="space-y-2">
                    <p className="text-sm uppercase tracking-[0.3em] font-light opacity-90">
                      {String(index + 1).padStart(2, '0')} / {String(lookbookImages.length).padStart(2, '0')}
                    </p>
                    <p className="text-xl md:text-2xl font-light opacity-90">
                      {image.subtitle}
                    </p>
                  </div>
                </div>

                {/* Decorative Corner Elements */}
                <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-white/30" />
                <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-white/30" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="relative h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-8 px-4">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white">
            Ready to Shop?
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Explore our full collection and find your perfect style
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              size="lg"
              onClick={() => navigate('/new')}
              className="text-lg px-8 py-6"
            >
              New Arrivals
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/')}
              className="text-lg px-8 py-6"
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
