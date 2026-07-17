import Image from "next/image";

/**
 * Section 4 — The Dining Room, at night. Where the day-to-night timeline lands:
 * by the time this is in view the page has reached `midnight` and the cove blue
 * starts to glow.
 */
export default function DiningRoom() {
  return (
    <section data-tone="night" className="px-6 py-24 sm:px-10 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <figure className="relative overflow-hidden rounded-sm">
          <Image
            src="/images/seating-area2.jpg"
            alt="The bar at night, the brushed-metal Coachman lockup lit on the wall above tables set with navy linen."
            width={2400}
            height={1874}
            sizes="(min-width: 1024px) 72rem, 100vw"
            className="h-auto w-full"
          />
          {/*
           * The cove glow. Sits over the photograph rather than in it, so the
           * LED blue arrives with the night instead of being baked into the
           * grade — and it costs nothing when the timeline is off.
           */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_60%_at_50%_0%,rgba(46,139,255,0.22),transparent_60%)]"
          />
        </figure>

        <div className="mt-14 grid gap-10 md:grid-cols-[1fr_1fr] md:gap-16">
          <h2 className="font-display text-2xl font-medium leading-tight lg:text-3xl">
            The room turns navy after dark
          </h2>

          <div className="max-w-[52ch] space-y-5 font-sans text-base opacity-80">
            <p>
              Electric-blue coves trace the ceiling and warm amber downlights sit
              above each table like starlight — the reason the room reads deep
              navy long after the terrace has gone gold.
            </p>
            <p>
              At the centre of it is the charcoal grill: fillet, rump and sirloin
              in 200g and 300g, the T-bone on the bone, and a 1&nbsp;kg prime cut
              for the table that came hungry.
            </p>
            <span
              aria-hidden
              className="dn-amber block h-px w-24 bg-gradient-to-r from-amber to-transparent"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
