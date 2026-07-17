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

    // Run the interpolation across the dusk band — the empty stretch between the
    // heritage strip and the dining room — but lead into it slightly, so night is
    // already falling as the last of the heritage copy leaves rather than waiting
    // for an empty screen to begin.
    //
    // The lead is budgeted, not eyeballed. The heritage copy is midnight ink on
    // the daylight ground, so every step the ground darkens under it costs
    // contrast: measured against these STOPS it holds 5.95:1 at progress 0.30 and
    // breaks the 4.5:1 AA floor by 0.40. Starting at `top 15%` (band top 15% down
    // the viewport) puts progress at ~0.27 — about 6.4:1 — at the instant the
    // paragraph clears the top edge, which is the worst moment. Earlier than this
    // and the text is dimming while you are still reading it. That is the whole
    // constraint: the copy must never be the thing that fades.
    const band = el.querySelector<HTMLElement>("[data-dn-band]") ?? el;

    const st = ScrollTrigger.create({
      trigger: band,
      start: "top 15%",
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
