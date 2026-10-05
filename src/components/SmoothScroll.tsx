import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";

// Site-wide inertia scrolling. Owns the single Lenis instance so route changes can reset
// scroll position through Lenis itself (a plain window.scrollTo here would fight its
// internal state) and so it can pause while a Radix Dialog/Sheet has body scroll locked —
// otherwise the background page would keep gliding underneath an open modal.
export const SmoothScroll = () => {
  const lenisRef = useRef<Lenis | null>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenisRef.current = lenis;

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // Radix's scroll lock (Dialog/Sheet) marks the body while open — pause Lenis for as
    // long as that's present so the underlying page can't scroll behind an open modal.
    const body = document.body;
    const syncLockState = () => {
      if (body.hasAttribute("data-scroll-locked")) {
        lenis.stop();
      } else {
        lenis.start();
      }
    };
    syncLockState();
    const observer = new MutationObserver(syncLockState);
    observer.observe(body, { attributes: true, attributeFilter: ["data-scroll-locked"] });

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    lenisRef.current?.scrollTo(0);
  }, [pathname]);

  return null;
};
