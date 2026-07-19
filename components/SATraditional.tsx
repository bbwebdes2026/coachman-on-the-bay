"use client";

import { useRef } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { saTraditionalDishes, formatPrice, type MenuItem } from "@/data/menu";

/**
 * Section 6a — South African Traditional Dishes (CLAUDE.md §Page structure item 6).
 *
 * Four Spotlight Cards (react.bits, adapted to the tokens), one per dish in
 * `saTraditionalDishes`. Everything on a card — name, description, price and the
 * printed wine-pairing note — comes straight from data/menu.ts; no copy is
 * invented here. The pairing line is the detail that differentiates these dishes
 * for international visitors, so it gets its own visually distinct row.
 *
 * The "spotlight" is a cove-blue radial glow that follows the cursor and lifts in
 * on hover/focus. It is purely decorative: all content is always present, never
 * gated behind the hover. Under `prefers-reduced-motion` the moving glow is
 * dropped for a static cove border, and nothing about the content changes.
 *
 * The cards are keyboard-focusable and, because the reveal is a hover effect,
 * focus triggers the same glow (centred, since there is no cursor). The visible
 * cove focus ring comes from the global :focus-visible rule in globals.css.
 */

function SpotlightCard({ dish }: { dish: MenuItem }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  // Track the cursor as card-local CSS vars; the glow (globals.css .sa-card__spot)
  // renders at that point. No state → no re-render on every mouse move.
  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (reduced || !el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${e.clientX - r.left}px`);
    el.style.setProperty("--spot-y", `${e.clientY - r.top}px`);
  };

  return (
    <article
      ref={ref}
      tabIndex={0}
      onMouseMove={handleMove}
      className={`sa-card group relative overflow-hidden rounded-lg border bg-navy-800 p-7 outline-none transition-colors duration-300 sm:p-8 ${
        reduced
          ? "border-cove/30"
          : "border-silver-400/12 hover:border-cove/25 focus:border-cove/25"
      }`}
    >
      {/* Cursor-following cove spotlight — motion only. Decorative, non-blocking. */}
      {!reduced && (
        <span
          aria-hidden
          className="sa-card__spot pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus:opacity-100"
        />
      )}

      <div className="relative">
        <div className="flex items-baseline justify-between gap-5">
          <h3 className="font-display text-2xl font-medium leading-tight text-silver-100 sm:text-3xl">
            {dish.name}
          </h3>
          {dish.price !== undefined && (
            <span className="price shrink-0 font-display text-xl font-medium text-silver-100 sm:text-2xl">
              {formatPrice(dish.price)}
            </span>
          )}
        </div>

        {dish.description && (
          <p className="mt-3 max-w-[48ch] font-sans text-sm leading-relaxed text-silver-100/70 sm:text-base">
            {dish.description}
          </p>
        )}

        {dish.pairing && (
          <p className="mt-5 border-t border-silver-400/12 pt-4 font-sans text-[0.8rem] leading-relaxed text-silver-400 sm:text-sm">
            {/* Cross-link to the wine on /menu. The wine cellar is the finest
                anchor the Flowing Menu navigator exposes, and every pairing wine
                lives there; the persistent underline is the audit rule for cove
                inline text on grey body copy (matches the footer tel: link). */}
            <Link
              href="/menu#wine-cellar"
              className="font-medium text-cove underline decoration-cove/50 underline-offset-2 transition-colors hover:decoration-cove"
            >
              Best served with {dish.pairing.wine}
            </Link>{" "}
            — {dish.pairing.note}
          </p>
        )}
      </div>
    </article>
  );
}

export default function SATraditional() {
  return (
    <section
      aria-labelledby="sa-traditional-heading"
      className="px-6 py-24 sm:px-10 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-2xl">
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-cove">
            South African
          </p>
          <h2
            id="sa-traditional-heading"
            className="text-chrome mt-3 font-display text-3xl font-medium leading-tight sm:text-5xl"
          >
            The traditional table
          </h2>
          <p className="mt-4 font-sans text-base leading-relaxed text-silver-100/70">
            Four dishes that carry the country — each set down with the Cape wine
            it is poured alongside.
          </p>
        </div>

        <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
          {saTraditionalDishes.map((dish) => (
            <SpotlightCard key={dish.name} dish={dish} />
          ))}
        </div>
      </div>
    </section>
  );
}
