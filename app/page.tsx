import Hero from "@/components/Hero";
import Heritage from "@/components/Heritage";
import DiningRoom from "@/components/DiningRoom";
import DayToNight from "@/components/DayToNight";

export default function Home() {
  return (
    <main>
      <Hero />

      {/* Sections 2→4: daylight terrace, the transition, night. */}
      <DayToNight>
        <Heritage />

        {/*
         * Section 3 — "The transition." Deliberately empty: this is the stretch
         * of scroll the day-to-night interpolation runs across, and it holds no
         * copy precisely so the background is free to pass through dusk without
         * dragging any text through mid-grey with it. A held beat, and the one
         * place the narrative is the only thing on screen.
         */}
        <div data-dn-band aria-hidden className="dusk-band h-[70vh]" />

        <DiningRoom />
      </DayToNight>
    </main>
  );
}
