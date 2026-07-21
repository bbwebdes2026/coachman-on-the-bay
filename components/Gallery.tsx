import Image from "next/image";
import GradualBlur from "./GradualBlur";

/**
 * Section 9 — Gallery (CLAUDE.md §Page structure item 9).
 *
 * A masonry of the graded food photography with Gradual Blur on the container's
 * top and bottom edges. CSS multi-column masonry keeps each shot at its own
 * aspect ratio (the library is a mix of landscape, square and portrait), and
 * every <Image> carries its intrinsic dimensions so there is no layout shift.
 *
 * Server component: no client JS, no hooks. The only motion-adjacent thing here
 * is the static edge blur, which is decorative and reduced-motion-safe by
 * construction (see GradualBlur).
 */

// Real, graded shots from the pipeline — width/height are the processed sizes in
// public/images/manifest.json, kept explicit so the masonry reserves space and
// nothing reflows as images decode. Alt text describes the dish, per the quality
// floor (never "image of").
const SHOTS = [
  {
    src: "/images/food-image2.jpg",
    width: 2400,
    height: 2400,
    alt: "Fresh oysters on the half shell over crushed ice, scattered with parsley and ringed with lemon and lime wedges.",
  },
  {
    src: "/images/food-image1.jpg",
    width: 2400,
    height: 1620,
    alt: "Five grilled prawns lined up over saffron-yellow rice, with a crisp garden salad and a bowl of golden chips on a navy-linen table.",
  },
  {
    src: "/images/food-image4.jpg",
    width: 2400,
    height: 2400,
    alt: "A char-grilled T-bone on a white platter with butternut mash, green beans and creamed potato, two glasses of red wine behind.",
  },
  {
    src: "/images/food-image5.jpg",
    width: 2178,
    height: 2400,
    alt: "A platter of golden fried calamari with chips, tartare sauce, butternut and creamed spinach, lit warm under the dining-room light.",
  },
  {
    src: "/images/food-image3.jpg",
    width: 2400,
    height: 2400,
    alt: "Seafood tagliatelle in a creamy tomato sauce with mussels and prawns, finished with fresh coriander and a slice of lime.",
  },
] as const;

export default function Gallery() {
  return (
    <section
      data-tone="night"
      aria-labelledby="gallery-heading"
      className="px-6 py-24 sm:px-10 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-2xl">
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-cove">
            From the pass
          </p>
          <h2
            id="gallery-heading"
            className="text-chrome mt-3 font-display text-3xl font-medium leading-tight sm:text-5xl"
          >
            Plated on the bay
          </h2>
          <p className="mt-4 font-sans text-base leading-relaxed text-silver-100/70">
            Oysters on ice, prawns off the grill, the T-bone on the bone — a few
            plates as they leave the kitchen.
          </p>
        </div>

        {/* Masonry, with the edges dissolved into the midnight top and bottom. */}
        <div className="relative">
          <div className="columns-1 gap-4 sm:columns-2 sm:gap-5 lg:columns-3">
            {SHOTS.map((shot) => (
              <figure
                key={shot.src}
                className="mb-4 break-inside-avoid overflow-hidden rounded-sm sm:mb-5"
              >
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  width={shot.width}
                  height={shot.height}
                  sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
                  className="h-auto w-full"
                />
              </figure>
            ))}
          </div>

          <GradualBlur position="top" className="h-16 sm:h-24" />
          <GradualBlur position="bottom" className="h-16 sm:h-24" />
        </div>
      </div>
    </section>
  );
}
