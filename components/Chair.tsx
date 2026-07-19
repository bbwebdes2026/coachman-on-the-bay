import Image from "next/image";

/**
 * Section 8 — The Chair (CLAUDE.md §Page structure item 8).
 *
 * The full-width feature for the notorious teal Coachman chair. This is one of
 * the only two sanctioned teal usages — and here the teal is carried entirely by
 * the photograph, exactly as the brief asks. No teal leaks into the chrome: the
 * eyebrow is neutral silver (deliberately NOT the cove eyebrow used elsewhere, so
 * nothing cool competes with the chair) and the copy is kept short and confident.
 *
 * Layout is a split rather than a wide full-bleed crop on purpose. The source is
 * near-square with the gold mark at the top and the tufted chair at the bottom; a
 * tall image panel crops the SIDES, keeping the full vertical — mark and chair
 * both survive — while the copy sits on its own midnight panel where contrast is
 * guaranteed. Photo leads on mobile (image on top), copy-left/image-right on
 * desktop. Static by design: no scroll or hover effect, so it is inherently safe
 * under reduced motion and ships zero client JS.
 */
export default function Chair() {
  return (
    <section
      data-tone="night"
      aria-labelledby="chair-heading"
      className="relative overflow-hidden md:grid md:min-h-[86vh] md:grid-cols-2"
    >
      {/* Image — top on mobile, right on desktop. Tall panel crops the sides, so
          both the gold mark and the tufted chair stay in frame. */}
      <div className="relative aspect-[4/3] w-full md:order-last md:aspect-auto md:h-full">
        <Image
          src="/images/the-notorious-coachman-chair.jpg"
          alt="The Coachman's signature teal tufted chair, crystal buttons catching the light, set against the deep-navy wall beneath the gold horse-and-carriage restaurant mark."
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover object-center"
        />
        {/* Seam blend on desktop: fade the image's inner edge into the copy panel. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden md:block md:bg-gradient-to-r md:from-midnight/70 md:via-transparent md:to-transparent"
        />
      </div>

      {/* Copy — below the image on mobile, left on desktop. Flex only kicks in at
          md so mobile stays plain block flow and the column constrains cleanly. */}
      <div className="px-6 py-16 sm:px-10 md:flex md:items-center md:px-14 md:py-24">
        <div className="max-w-xl">
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-silver-400">
            The Coachman Chair
          </p>
          <h2
            id="chair-heading"
            className="text-chrome mt-4 max-w-[14ch] font-display text-3xl font-medium leading-[1.05] sm:text-5xl lg:text-6xl"
          >
            Every institution has a throne.
          </h2>
          <p className="mt-6 max-w-md font-sans text-base leading-relaxed text-silver-100/75">
            The teal tufted chair beneath the horse-and-carriage mark, its crystal
            buttons catching the light — the one seat the whole room remembers.
          </p>
        </div>
      </div>
    </section>
  );
}
