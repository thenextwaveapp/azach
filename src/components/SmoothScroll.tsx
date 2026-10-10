import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import Lenis from "lenis";

// Scroll positions per pathname, persisted for the tab so a reload also lands
// where the user left off.
const STORAGE_KEY = "azach-scroll-positions";

const loadPositions = (): Record<string, number> => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
};

// Site-wide inertia scrolling. Owns the single Lenis instance so route changes can reset
// scroll position through Lenis itself (a plain window.scrollTo here would fight its
// internal state) and so it can pause while a Radix Dialog/Sheet has body scroll locked —
// otherwise the background page would keep gliding underneath an open modal.
//
// It also owns scroll restoration: every page's position is tracked while the user
// scrolls, and navigating back/forward returns them to where they stopped instead of
// the top. Fresh navigations (link clicks) still start at the top.
export const SmoothScroll = () => {
  const lenisRef = useRef<Lenis | null>(null);
  const positionsRef = useRef<Record<string, number>>();
  const pathRef = useRef<string>();
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  if (positionsRef.current === undefined) {
    positionsRef.current = loadPositions();
  }
  if (pathRef.current === undefined) {
    pathRef.current = pathname;
  }

  useEffect(() => {
    // The browser's own restoration would fight both Lenis and ours.
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenisRef.current = lenis;

    lenis.on("scroll", () => {
      positionsRef.current![pathRef.current!] = window.scrollY;
    });

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

    const persist = () => {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positionsRef.current));
      } catch {
        // storage full/unavailable — restoration just won't survive a reload
      }
    };
    window.addEventListener("pagehide", persist);

    return () => {
      window.removeEventListener("pagehide", persist);
      persist();
      observer.disconnect();
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    pathRef.current = pathname;
    // Back/forward (and reloads) return to the stored position; fresh navigations start
    // at the top.
    const target = navigationType === "POP" ? positionsRef.current?.[pathname] ?? 0 : 0;

    const jumpTo = (y: number) => {
      lenisRef.current?.scrollTo(y, { immediate: true, force: true });
      // When a route swap briefly shrinks the page, the browser clamps the real scroll
      // position without Lenis noticing — it then believes it is already at `y` and
      // no-ops. A native jump fixes the real position; Lenis resyncs through its own
      // scroll listener.
      if (Math.abs(window.scrollY - y) > 2) {
        window.scrollTo(0, y);
      }
    };

    // Async data (products etc.) can land after the route renders: the page is briefly
    // too short, the browser clamps the scroll back toward 0, then the content arrives.
    // So keep re-asserting the stored position for a short window, and stop early only
    // when the user genuinely takes over (wheel/touch/keys) — a clamped scrollY alone
    // is indistinguishable from that and must not cancel the restore.
    let cancelled = false;
    const cancel = () => {
      cancelled = true;
    };
    const userEvents: (keyof WindowEventMap)[] = ["wheel", "touchstart", "keydown"];
    userEvents.forEach((e) => window.addEventListener(e, cancel, { passive: true }));

    let attempts = 0;
    let timer: number | undefined;
    const settle = () => {
      if (cancelled || attempts >= 10) return;
      if (attempts > 0 && Math.abs(window.scrollY - target) <= 2) return;
      attempts += 1;
      jumpTo(target);
      // 0 is always reachable — no clamp to outwait, and looping would fight any
      // scrolling the new page does itself right after mounting.
      if (target > 0) timer = window.setTimeout(settle, 150);
    };
    settle();

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positionsRef.current));
    } catch {
      // ignore
    }

    return () => {
      cancelled = true;
      if (timer !== undefined) clearTimeout(timer);
      userEvents.forEach((e) => window.removeEventListener(e, cancel));
    };
  }, [pathname, navigationType]);

  return null;
};
