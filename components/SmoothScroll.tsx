"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Site-wide Lenis smooth scroll.
 *
 * Respects `prefers-reduced-motion`: when the user asks for reduced motion we
 * never instantiate Lenis, so the page falls back to native scrolling with no
 * inertia. We also re-check on change, so a mid-session toggle is honoured.
 *
 * Lenis drives ScrollTrigger. Lenis moves the page on its own rAF loop rather
 * than by native scrolling, so without this ScrollTrigger reads a stale scroll
 * position and every scrubbed timeline (the day-to-night narrative) lags behind
 * the page by a frame or more.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");

    let lenis: Lenis | null = null;
    let rafId = 0;

    const start = () => {
      if (lenis) return;
      gsap.registerPlugin(ScrollTrigger);
      lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
      });

      lenis.on("scroll", ScrollTrigger.update);

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
      ScrollTrigger.update();
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
