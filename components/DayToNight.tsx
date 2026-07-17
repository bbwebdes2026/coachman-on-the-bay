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

/**
 * Background only. Text colour is NOT animated, and must not be.
 *
 * Interpolating ink and ground together looks obvious on paper and fails in
 * practice: both pass through mid-grey at the same moment, and contrast
 * collapses to about 1.2:1 — the copy vanishes mid-scroll. There is no curve
 * that fixes it, because any crossfade from dark ink to light ink has to cross
 * the middle. So each section keeps a fixed, legible colour (see data-tone in
 * globals.css) and only the ground moves, in the gap between sections where no
 * text is on screen.
 *
 * Mirrors the design tokens in tailwind.config.ts.
 */
const STOPS: { at: number; bg: Rgb; accent: number }[] = [
  // Daylight: the terrace.
  { at: 0, bg: [0xf4, 0xf7, 0xf9], accent: 0 },
  // Dusk: the bay going blue. Sits between coast-300 and midnight, which is
  // what keeps the transition reading as evening rather than as a grey fade.
  { at: 0.55, bg: [0x2c, 0x3d, 0x5a], accent: 0.5 },
  // Night: the dining room, and amber up.
  { at: 1, bg: [0x0a, 0x12, 0x20], accent: 1 },
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

  return { bg: mix(from.bg, to.bg), accent: lerp(from.accent, to.accent, t) };
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
      const { bg, accent } = sample(progress);
      root.style.setProperty("--dn-bg", bg);
      root.style.setProperty("--dn-accent", String(accent));
    };

    apply(0);
    root.classList.add("dn-active");

    // Run the whole interpolation across the dusk band — the empty stretch
    // between the heritage strip and the dining room. Anchoring to it is what
    // keeps text out of the transition: it only begins once the band's top
    // reaches the top of the viewport, by which point the heritage copy has
    // left, and it finishes before the dining room's copy has arrived.
    const band = el.querySelector<HTMLElement>("[data-dn-band]") ?? el;

    const st = ScrollTrigger.create({
      trigger: band,
      start: "top top",
      end: "bottom 30%",
      scrub: 0.5,
      onUpdate: (self) => apply(self.progress),
    });

    return () => {
      st.kill();
      root.classList.remove("dn-active");
      for (const p of ["--dn-bg", "--dn-accent"]) root.style.removeProperty(p);
    };
  }, [reduced]);

  return <div ref={ref}>{children}</div>;
}
