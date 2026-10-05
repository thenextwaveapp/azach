import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { OptimizedImage } from "@/components/OptimizedImage";

export const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Exiting fullscreen (either the standard API or iOS's video-only fullscreen) should
  // resume the muted background loop rather than leaving it paused.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const resumeBackgroundLoop = () => {
      video.muted = true;
      video.controls = false;
      video.play().catch(() => {});
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) resumeBackgroundLoop();
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    video.addEventListener("webkitendfullscreen", resumeBackgroundLoop);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      video.removeEventListener("webkitendfullscreen", resumeBackgroundLoop);
    };
  }, []);

  const handleExpandVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.controls = true;
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if ((video as any).webkitEnterFullscreen) {
      // iOS Safari
      (video as any).webkitEnterFullscreen();
    }
  };

  return (
    <section className="relative h-[calc(100dvh-64px)] lg:h-[calc(100vh-64px)] overflow-hidden bg-[#f5f0e8]">
      {/* Mobile: full-bleed hero video, no text overlay */}
      <video
        ref={videoRef}
        className="lg:hidden absolute inset-0 h-full w-full object-cover"
        src="/hero-video.mp4"
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Mobile: subtle play button to expand video fullscreen */}
      <div className="lg:hidden absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <button
          onClick={handleExpandVideo}
          aria-label="Play video fullscreen"
          className="pointer-events-auto h-14 w-14 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center border border-white/50"
        >
          <Play className="h-6 w-6 text-white fill-white ml-0.5" />
        </button>
      </div>

      {/* Mobile: CTA buttons over the video */}
      <div className="lg:hidden absolute inset-x-0 bottom-6 px-4 z-10 flex flex-col sm:flex-row gap-4">
        <Link to="/shop-all" className="flex-1">
          <Button size="lg" className="btn-shine bg-[#a97c50] text-white hover:bg-[#8b6440] uppercase font-semibold w-full shadow-lg hover:shadow-xl active:scale-[0.97] transition-all duration-150">
            Shop All
          </Button>
        </Link>
        <Link to="/bespoke" className="flex-1">
          <Button size="lg" variant="outline" className="border-2 border-black bg-white text-black hover:bg-white/90 uppercase font-semibold w-full shadow-lg hover:shadow-xl active:scale-[0.97] transition-all duration-150">
            Custom Request
          </Button>
        </Link>
      </div>

      <div className="hidden lg:block container mx-auto px-4 h-full">
        <div className="grid lg:grid-cols-2 gap-8 h-full items-center">
          {/* Left: Text Content */}
          <div className="space-y-6 lg:pr-12">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-tight">
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
                <Button size="lg" className="btn-shine bg-[#a97c50] text-white hover:bg-[#8b6440] uppercase font-semibold px-8 w-full sm:w-auto shadow-lg hover:shadow-xl active:scale-[0.97] transition-all duration-150">
                  Shop All
                </Button>
              </Link>
              <Link to="/bespoke">
                <Button size="lg" variant="outline" className="border-2 border-foreground hover:bg-foreground hover:text-background uppercase font-semibold px-8 w-full sm:w-auto shadow-lg hover:shadow-xl active:scale-[0.97] transition-all duration-150">
                  Custom Request
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: Image */}
          <div className="relative h-full hidden lg:flex items-center justify-center">
            <img
              src="/hero-image.png"
              alt="AZACH Hero - Reconstructed Fashion"
              className="h-full w-auto object-contain"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
