"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Site-wide Lenis smooth scroll.
 *
 * Respects `prefers-reduced-motion`: when the user asks for reduced motion we
 * never instantiate Lenis, so the page falls back to native scrolling with no
 * inertia. We also re-check on change, so a mid-session toggle is honoured.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");

    let lenis: Lenis | null = null;
    let rafId = 0;

    const start = () => {
      if (lenis) return;
      lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
      });

      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    };

    const stop = () => {
      cancelAnimationFrame(rafId);
      lenis?.destroy();
      lenis = null;
    };

    const sync = () => {
      if (mql.matches) stop();
      else start();
    };

    sync();
    mql.addEventListener("change", sync);

    return () => {
      mql.removeEventListener("change", sync);
      stop();
    };
  }, []);

  return null;
}
