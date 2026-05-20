import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { OptimizedImage } from "@/components/OptimizedImage";

export const Hero = () => {
  return (
    <section className="relative h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <OptimizedImage
        src="/hero-image.png"
        alt="AZACH Hero - Reconstructed Fashion"
        aspectRatio="landscape"
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-tight">
            RECONSTRUCTED.<br />NOT MASS PRODUCED.
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-white/90 font-light max-w-3xl mx-auto">
            Every piece is one-of-one, rebuilt from existing materials into something entirely new.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link to="/shop-all">
              <Button size="lg" className="bg-[#a97c50] text-white hover:bg-[#8b6440] uppercase font-bold px-8 w-full sm:w-auto">
                Shop New Pieces
              </Button>
            </Link>
            <Link to="/bespoke">
              <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black uppercase font-bold px-8 w-full sm:w-auto">
                Custom Request
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-white rounded-full" />
        </div>
      </div>
    </section>
  );
};
