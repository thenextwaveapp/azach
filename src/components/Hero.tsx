import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { OptimizedImage } from "@/components/OptimizedImage";

export const Hero = () => {
  return (
    <section className="relative h-[calc(100vh-64px)] overflow-hidden bg-[#f5f0e8]">
      <div className="container mx-auto px-4 h-full">
        <div className="grid lg:grid-cols-2 gap-8 h-full items-center">
          {/* Left: Text Content */}
          <div className="space-y-6 lg:pr-12">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
              RECONSTRUCTED.<br />NOT MASS PRODUCED.
            </h1>
            <div className="space-y-2 text-lg md:text-xl text-muted-foreground">
              <p>One-of-one pieces,</p>
              <p>rebuilt from existing materials.</p>
              <p>Designed with intention.</p>
              <p>Made to last.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/shop-all">
                <Button size="lg" className="bg-[#a97c50] text-white hover:bg-[#8b6440] uppercase font-bold px-8 w-full sm:w-auto">
                  Shop New Pieces
                </Button>
              </Link>
              <Link to="/bespoke">
                <Button size="lg" variant="outline" className="border-2 border-foreground hover:bg-foreground hover:text-background uppercase font-bold px-8 w-full sm:w-auto">
                  Custom Request
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: Image */}
          <div className="relative h-full hidden lg:block">
            <OptimizedImage
              src="/hero-image.png"
              alt="AZACH Hero - Reconstructed Fashion"
              aspectRatio="portrait"
              className="absolute inset-0 w-full h-full object-cover object-center"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
