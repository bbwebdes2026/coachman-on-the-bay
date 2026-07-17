import Hero from "@/components/Hero";
import Heritage from "@/components/Heritage";
import DiningRoom from "@/components/DiningRoom";
import DayToNight from "@/components/DayToNight";

export default function Home() {
  return (
    <main>
      <Hero />

      {/*
       * Sections 2→4. The background interpolates from the daylight terrace
       * through dusk into midnight across exactly this span, so the dining room
       * is already at night when it arrives.
       */}
      <DayToNight>
        <Heritage />
        <DiningRoom />
      </DayToNight>
    </main>
  );
}
