"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";

/**
 * The day-to-night scroll narrative — the site's structural signature.
 *
 * One continuous timeline, scrubbed to scroll: the page background interpolates
 * from the daylight terrace, through dusk, into `midnight` while the foreground
 * lightens to silver and amber accents fade up. Wraps the sections it spans.
 *
 * How it renders, and why it survives having no JS:
 *   - Each section declares its own end-state colours via `data-tone`, so the
 *     page is correct and readable with no JS, before hydration, and with
 *     motion reduced. See globals.css.
 *   - Only once this mounts (and motion is allowed) does it set `dn-active` on
 *     <html>, which makes the sections transparent and hands the background to
 *     the animated custom properties. So the animation is purely additive.
 *
 * Colours are driven through CSS custom properties rather than by tweening each
 * element: one interpolation per frame regardless of how much is on screen, and
 * it composites on the GPU.
 */

type Rgb = [number, number, number];

/** Mirrors the design tokens in tailwind.config.ts. */
const STOPS: { at: number; bg: Rgb; fg: Rgb; accent: number }[] = [
  // Daylight: the terrace. coast-50 ground, midnight ink.
  { at: 0, bg: [0xf4, 0xf7, 0xf9], fg: [0x0a, 0x12, 0x20], accent: 0 },
  // Dusk: the bay going blue. Sits between coast-300 and midnight, which is
  // what keeps the transition reading as evening rather than as a grey fade.
  { at: 0.55, bg: [0x2c, 0x3d, 0x5a], fg: [0xc3, 0xcd, 0xda], accent: 0.5 },
  // Night: the dining room. midnight ground, silver-100 ink, amber up.
  { at: 1, bg: [0x0a, 0x12, 0x20], fg: [0xe6, 0xea, 0xef], accent: 1 },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function sample(progress: number) {
  const p = Math.min(1, Math.max(0, progress));
  let i = 0;
  while (i < STOPS.length - 2 && p > STOPS[i + 1].at) i++;
  const from = STOPS[i];
  const to = STOPS[i + 1];
  const span = to.at - from.at;
  const t = span === 0 ? 0 : (p - from.at) / span;

  const mix = (a: Rgb, b: Rgb): string =>
    `rgb(${Math.round(lerp(a[0], b[0], t))} ${Math.round(lerp(a[1], b[1], t))} ${Math.round(lerp(a[2], b[2], t))})`;

  return {
    bg: mix(from.bg, to.bg),
    fg: mix(from.fg, to.fg),
    accent: lerp(from.accent, to.accent, t),
  };
}

export default function DayToNight({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (reduced || !el) return;

    gsap.registerPlugin(ScrollTrigger);
    const root = document.documentElement;

    const apply = (progress: number) => {
      const { bg, fg, accent } = sample(progress);
      root.style.setProperty("--dn-bg", bg);
      root.style.setProperty("--dn-fg", fg);
      root.style.setProperty("--dn-accent", String(accent));
    };

    apply(0);
    root.classList.add("dn-active");

    const st = ScrollTrigger.create({
      trigger: el,
      // Starts as the heritage strip enters, completes as the dining room
      // settles into view — so the room arrives already at night.
      start: "top 80%",
      end: "70% 45%",
      scrub: 0.5,
      onUpdate: (self) => apply(self.progress),
    });

    return () => {
      st.kill();
      root.classList.remove("dn-active");
      for (const p of ["--dn-bg", "--dn-fg", "--dn-accent"]) {
        root.style.removeProperty(p);
      }
    };
  }, [reduced]);

  return <div ref={ref}>{children}</div>;
}
