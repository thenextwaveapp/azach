import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <section className="relative h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="text-xs md:text-sm uppercase tracking-[0.3em] text-white/80 font-light mb-4">
            Est. Lagos, Nigeria
          </div>
          <h1 className="text-7xl md:text-[10rem] font-bold tracking-tight font-display text-white leading-none">
            UPCYCLED DENIM
          </h1>
          <p className="text-xl md:text-3xl text-white/90 font-light max-w-2xl mx-auto">
            From discarded fabric to timeless fashion
          </p>
          <div className="flex gap-4 justify-center pt-8">
            <Link to="/our-story">
              <Button size="lg" className="bg-white text-black hover:bg-white/90 uppercase font-bold px-8">
                Our Story
              </Button>
            </Link>
            <Link to="/lookbook">
              <Button size="lg" className="bg-black text-white hover:bg-black/90 group uppercase font-bold px-8">
                Our Looks
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
