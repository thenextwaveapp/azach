import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // The campaign film only plays fullscreen on demand — once the viewer exits
  // fullscreen (standard API or iOS's video-only fullscreen), stop playback.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const stopPlayback = () => {
      video.pause();
      video.muted = true;
      video.controls = false;
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) stopPlayback();
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    video.addEventListener("webkitendfullscreen", stopPlayback);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      video.removeEventListener("webkitendfullscreen", stopPlayback);
    };
  }, []);

  const handleWatchFilm = () => {
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
    video.play().catch(() => {});
  };

  return (
    <section className="relative h-[calc(100dvh-64px)] lg:h-[calc(100vh-64px)] overflow-hidden bg-[#f5f0e8]">
      {/* Campaign image */}
      <img
        src="/campaign/hero-home.jpg"
        alt="AZACH — Reconstruction Into Refinement campaign"
        className="absolute inset-0 h-full w-full object-cover object-[center_22%]"
        loading="eager"
      />
      {/* Legibility overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/10" />

      {/* Hidden campaign film — opened fullscreen via "Watch the Film" */}
      <video
        ref={videoRef}
        className="absolute h-px w-px opacity-0 pointer-events-none"
        src="/hero-video.mp4"
        preload="metadata"
        playsInline
      />

      <div className="relative z-10 container mx-auto px-4 h-full flex items-end lg:items-center">
        <div className="max-w-2xl pb-16 lg:pb-0 text-white">
          <h1
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05]"
            style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.4)" }}
          >
            RECONSTRUCTION
            <br />
            INTO
            <br />
            REFINEMENT
          </h1>
          <p className="mt-5 text-lg md:text-xl text-white/90 max-w-md">
            Contemporary pieces made from what already exist
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-8">
            <Link to="/shop-all">
              <Button
                size="lg"
                className="btn-shine bg-[#a97c50] text-white hover:bg-[#8b6440] uppercase font-semibold tracking-wider px-8 w-full sm:w-auto shadow-lg hover:shadow-xl active:scale-[0.97] transition-all duration-150"
              >
                Explore the Collection
              </Button>
            </Link>
            <Button
              size="lg"
              onClick={handleWatchFilm}
              className="bg-white text-black hover:bg-white/90 uppercase font-semibold tracking-wider px-8 w-full sm:w-auto shadow-lg hover:shadow-xl active:scale-[0.97] transition-all duration-150"
            >
              Watch the Film
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
