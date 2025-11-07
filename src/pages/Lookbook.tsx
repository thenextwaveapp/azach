import { useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const lookbookImages = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d',
    title: 'Spring Collection',
    subtitle: 'Fresh & Vibrant',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b',
    title: 'Urban Essentials',
    subtitle: 'Street Style',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c',
    title: 'Minimalist Lines',
    subtitle: 'Clean & Classic',
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f',
    title: 'Evening Elegance',
    subtitle: 'Timeless Sophistication',
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2',
    title: 'Casual Comfort',
    subtitle: 'Everyday Luxury',
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b',
    title: 'Bold Statements',
    subtitle: 'Make an Impact',
  },
  {
    id: 7,
    url: 'https://images.unsplash.com/photo-1445205170230-053b83016050',
    title: 'Summer Breeze',
    subtitle: 'Light & Airy',
  },
  {
    id: 8,
    url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105',
    title: 'Autumn Tones',
    subtitle: 'Warm & Cozy',
  },
  {
    id: 9,
    url: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93',
    title: 'Winter Layers',
    subtitle: 'Stay Warm in Style',
  },
  {
    id: 10,
    url: 'https://images.unsplash.com/photo-1467043237213-65f2da53396f',
    title: 'Signature Pieces',
    subtitle: 'Defining Moments',
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
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
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
          <h1 className="text-7xl md:text-9xl font-bold tracking-tighter font-display">
            LOOKBOOK
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Explore our latest collection through a curated visual journey
          </p>
          <div className="flex flex-col items-center gap-2 pt-8">
            <p className="text-sm text-muted-foreground">Scroll to explore</p>
            <div className="animate-bounce">
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
              <div className="relative w-full h-full overflow-hidden rounded-3xl bg-muted">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover"
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
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                      {image.title}
                    </h1>
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
      <div className="relative h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="text-center space-y-8 px-4">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter">
            Ready to Shop?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
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
