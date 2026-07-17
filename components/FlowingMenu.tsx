"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useReducedMotion } from "framer-motion";
import { navigatorCategories } from "@/data/menu";

/**
 * Section 5 — the Flowing Menu navigator (CLAUDE.md §Page structure item 5).
 *
 * Six rows, one per navigator category. At rest each is a large serif name on
 * midnight. On hover a silver panel slides in from the edge the cursor crossed
 * and a strip of the category name and its photography drifts across it — the
 * react.bits Flowing Menu, adapted to the tokens. Each row links to the matching
 * anchor on /menu.
 *
 * The reveal is the one place the hover language earns motion: the panel entry
 * is edge-aware (GSAP), the drift is CSS (see .marquee-track in globals.css).
 * With reduced motion the rows stay static links — fully usable, no panel.
 */

// Decorative strip imagery per category. The strip is aria-hidden — the row's
// accessible name is the link text — so these carry no alt obligation; they are
// chosen to feel right against each category, not to assert a specific dish.
const STRIP_IMAGES: Record<string, string[]> = {
  starters: ["/images/food-image1.jpg", "/images/food-image2.jpg", "/images/food-image3.jpg"],
  seafood: ["/images/food-image3.jpg", "/images/food-image5.jpg", "/images/food-image1.jpg"],
  "charcoal-grill": ["/images/food-image4.jpg", "/images/food-image1.jpg", "/images/food-image2.jpg"],
  "south-african-traditional": ["/images/food-image2.jpg", "/images/food-image4.jpg", "/images/food-image3.jpg"],
  burgers: ["/images/food-image5.jpg", "/images/food-image4.jpg", "/images/food-image1.jpg"],
  "wine-cellar": ["/images/bar-area.jpg", "/images/food-image5.jpg", "/images/food-image2.jpg"],
};

type Edge = "top" | "bottom";

function nearestEdge(mouseY: number, rect: DOMRect): Edge {
  return Math.abs(mouseY - rect.top) < Math.abs(mouseY - rect.bottom) ? "top" : "bottom";
}

function FlowingRow({
  id,
  title,
  images,
}: {
  id: string;
  title: string;
  images: string[];
}) {
  const itemRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const animate = (clientY: number, direction: "in" | "out") => {
    const item = itemRef.current;
    const panel = panelRef.current;
    if (reduced || !item || !panel) return;

    const edge = nearestEdge(clientY, item.getBoundingClientRect());
    const offEdge = edge === "top" ? "-101%" : "101%";
    const tl = gsap.timeline({ defaults: { duration: 0.6, ease: "expo.out" } });
    if (direction === "in") {
      tl.set(panel, { y: offEdge }).to(panel, { y: "0%" });
    } else {
      tl.to(panel, { y: offEdge });
    }
  };

  // One seamless half of the drifting strip: the name, then its images. The
  // JSX below renders it twice so the -50% loop has nothing to jump across.
  const half = (
    <div className="flex items-center">
      {images.map((src, i) => (
        <span key={i} className="flex items-center">
          <span className="whitespace-nowrap px-8 font-display text-3xl font-medium text-midnight sm:text-5xl">
            {title}
          </span>
          <span
            className="mx-4 h-16 w-28 shrink-0 rounded-sm bg-cover bg-center sm:h-24 sm:w-44"
            style={{ backgroundImage: `url(${src})` }}
          />
        </span>
      ))}
    </div>
  );

  return (
    <div
      ref={itemRef}
      onMouseEnter={(e) => animate(e.clientY, "in")}
      onMouseLeave={(e) => animate(e.clientY, "out")}
      className="relative overflow-hidden border-t border-silver-400/15 last:border-b"
    >
      <Link
        href={`/menu#${id}`}
        className="relative z-10 flex items-center justify-between gap-4 px-6 py-7 sm:px-10 sm:py-9"
      >
        <span className="font-display text-3xl font-medium leading-none text-silver-100 sm:text-5xl">
          {title}
        </span>
        <span
          aria-hidden
          className="font-sans text-[0.7rem] uppercase tracking-[0.25em] text-silver-400"
        >
          View
        </span>
      </Link>

      {/*
       * The reveal panel. pointer-events-none so the cursor stays on the row and
       * clicks fall through to the link beneath. translate-y-full is the resting
       * hidden state before any hover and after GSAP hands back; aria-hidden
       * because the strip only repeats the link's own name.
       */}
      <div
        ref={panelRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 flex translate-y-full items-center overflow-hidden bg-silver-100"
      >
        <div className="marquee-track flex shrink-0">
          {half}
          {half}
        </div>
      </div>
    </div>
  );
}

export default function FlowingMenu() {
  return (
    <section
      aria-labelledby="menu-navigator-heading"
      className="px-6 py-24 sm:px-10 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-sans text-xs uppercase tracking-[0.3em] text-cove">
              The Menu
            </p>
            <h2
              id="menu-navigator-heading"
              className="text-chrome mt-3 font-display text-4xl font-medium leading-tight sm:text-5xl"
            >
              Six ways to begin
            </h2>
          </div>
          <Link
            href="/menu"
            className="font-sans text-sm text-silver-100 underline decoration-silver-400/40 underline-offset-4 transition-colors hover:text-cove hover:decoration-cove"
          >
            View the full menu
          </Link>
        </div>

        <div>
          {navigatorCategories.map((cat) => (
            <FlowingRow
              key={cat.id}
              id={cat.id}
              title={cat.title}
              images={STRIP_IMAGES[cat.id] ?? ["/images/food-image1.jpg"]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
