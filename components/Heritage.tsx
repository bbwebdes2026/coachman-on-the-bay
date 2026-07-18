import Image from "next/image";
import ScrollReveal from "./ScrollReveal";

/**
 * Section 2 — the heritage strip. Opens in daylight (`data-tone="day"`) and is
 * where the day-to-night interpolation begins; by the dining room it is night.
 *
 * The founding year (1978, owner-confirmed) is worked into the copy as a genuine
 * heritage asset — stated once, plainly, then the room does the rest.
 */
export default function Heritage() {
  return (
    <section data-tone="day" className="px-6 py-24 sm:px-10 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1fr_0.85fr] md:items-center md:gap-16">
        <div>
          <p className="font-sans text-xs uppercase tracking-[0.35em] opacity-60">
            On the bay
          </p>

          <ScrollReveal
            className="mt-6 max-w-[46ch] font-display text-xl leading-[1.35] sm:text-2xl"
            text="The Coachman has kept its table on the Gqeberha beachfront since 1978 — long enough that the bay reads as part of the room. A charcoal grill at its heart, seafood off the same coast you are looking at, and a cellar deep enough to keep you seated well past the plates."
          />
        </div>

        <figure className="relative">
          <Image
            src="/images/Seating-area1-duo.jpg"
            alt="The dining room rendered in navy and silver: tables set beneath the long curve of the ceiling coves."
            width={2400}
            height={1874}
            sizes="(min-width: 768px) 44vw, 100vw"
            className="h-auto w-full rounded-sm"
          />
          <figcaption className="mt-4 font-sans text-xs uppercase tracking-[0.2em] opacity-50">
            The dining room
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
