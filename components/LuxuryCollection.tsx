"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { luxuryCollection, formatPrice } from "@/data/menu";

/**
 * Section 7 — The Luxury Collection (CLAUDE.md §Page structure item 7).
 *
 * The premium red tier as an elegant serif list — dish-name pattern throughout:
 * Cormorant name left, tabular price right, silver hairline rules between, tasting
 * note in body sans. Everything comes from `luxuryCollection` in data/menu.ts.
 *
 * Background is the site's one sanctioned use of the Silk shader. It is expensive
 * (WebGL), so it is strictly optional chrome:
 *   • the static midnight-navy gradient is the base layer — SSR paint, the mobile
 *     fallback, and the reduced-motion state;
 *   • the live Silk canvas is dynamically imported (ssr:false → its own chunk with
 *     `ogl`) and mounted ONLY on ≥768px, motion-allowed viewports, and only once
 *     the section scrolls into view. Phones and reduced-motion visitors never
 *     download or run it — they keep the gradient, which already reads as fabric.
 */

const Silk = dynamic(() => import("./Silk"), { ssr: false });

export default function LuxuryCollection() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [showSilk, setShowSilk] = useState(false);

  useEffect(() => {
    if (reduced) return;
    // Never pay the shader cost on phones — the gradient carries them.
    if (!window.matchMedia("(min-width: 768px)").matches) return;

    const el = sectionRef.current;
    if (!el) return;

    // Mount the shader only when the section is near/into view.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShowSilk(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      data-tone="night"
      aria-labelledby="luxury-heading"
      className="relative overflow-hidden px-6 py-28 sm:px-10 sm:py-36"
    >
      {/* Base layer: static midnight-navy silk gradient. Always painted. */}
      <div aria-hidden className="silk-fallback absolute inset-0" />

      {/* Live silk, faded in over the gradient on capable viewports. */}
      {showSilk && (
        <motion.div
          aria-hidden
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        >
          <Silk />
        </motion.div>
      )}

      {/* Vignette — deepens the edges and seats the list over either background. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_45%,transparent_35%,rgba(10,18,32,0.72)_100%)]"
      />

      <div className="relative mx-auto max-w-3xl">
        <div className="max-w-2xl">
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-cove">
            The Cellar
          </p>
          <h2
            id="luxury-heading"
            className="text-chrome mt-3 font-display text-3xl font-medium leading-tight sm:text-5xl"
          >
            The Luxury Collection
          </h2>
          <p className="mt-4 font-sans text-base leading-relaxed text-silver-100/70">
            The cellar&rsquo;s premium reds — Cape benchmarks from the Meerlust
            Rubicon down — kept for the evening that calls for them.
          </p>
        </div>

        <ol className="mt-14 divide-y divide-silver-400/12">
          {luxuryCollection.items.map((wine) => (
            <li key={wine.name} className="grid gap-2 py-6 sm:py-7">
              <div className="flex items-baseline justify-between gap-5">
                <h3 className="font-display text-2xl font-medium leading-tight text-silver-100 sm:text-3xl">
                  {wine.name}
                </h3>
                {wine.price !== undefined && (
                  <span className="price shrink-0 font-display text-xl font-medium text-silver-100 sm:text-2xl">
                    {formatPrice(wine.price)}
                  </span>
                )}
              </div>
              {wine.tastingNote && (
                <p className="max-w-[62ch] font-sans text-sm leading-relaxed text-silver-100/65 sm:text-[0.95rem]">
                  {wine.tastingNote}
                </p>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
