import Image from "next/image";
import BlurText from "./BlurText";

/**
 * Section 1 — "Arrival."
 *
 * Full-bleed daylight terrace photograph. The image is the one place the site
 * opens in daylight, so it carries the top of the day-to-night narrative.
 */
export default function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col justify-between overflow-hidden">
      <Image
        src="/images/terrace-bay.jpg"
        alt="Terrace tables dressed in navy linen beneath a white umbrella, the bay stretching out beyond the railing in full daylight."
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover object-[center_42%]"
      />

      {/*
       * Scrims, not decoration: the source photograph is a 448px panel taken to
       * 1792px, so it is soft under scrutiny. Weighting the corners keeps the
       * type legible and lets the softness read as depth of field.
       */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-midnight/45 via-transparent to-midnight/80"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-midnight/50 via-transparent to-transparent"
      />

      <header className="p-6 sm:p-10">
        <Image
          src="/images/coachman-mark.png"
          alt="The Coachman Restaurant"
          width={955}
          height={563}
          priority
          sizes="(min-width: 640px) 176px, 132px"
          className="h-auto w-[132px] drop-shadow-[0_1px_12px_rgba(10,18,32,0.55)] sm:w-[176px]"
        />
      </header>

      <div className="px-6 pb-16 sm:px-10 sm:pb-20">
        <h1 className="max-w-[14ch] font-display text-2xl font-medium leading-none text-silver-100 md:text-3xl lg:text-4xl">
          <BlurText text="The Coachman" />
        </h1>

        <p className="mt-5 max-w-[36ch] font-sans text-base text-silver-100/85 sm:text-lg">
          Fine dining on the bay — Gqeberha
        </p>

        <a
          href="#visit"
          className="mt-9 inline-flex items-center rounded-[3px] bg-amber px-7 py-3 font-sans text-sm font-semibold uppercase tracking-widest text-midnight transition-transform duration-200 ease-out hover:scale-[1.02]"
        >
          Reserve a table
        </a>
      </div>

      {/* Scroll cue — the day-to-night narrative only exists if people scroll. */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 sm:flex"
      >
        <span className="font-sans text-xs uppercase tracking-[0.3em] text-silver-100/70">
          Scroll
        </span>
        <span className="h-12 w-px bg-gradient-to-b from-silver-100/70 to-transparent" />
      </div>
    </section>
  );
}
