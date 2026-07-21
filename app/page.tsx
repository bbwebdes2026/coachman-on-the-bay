import Hero from "@/components/Hero";
import Heritage from "@/components/Heritage";
import DiningRoom from "@/components/DiningRoom";
import DayToNight from "@/components/DayToNight";
import DuskStars from "@/components/DuskStars";
import FlowingMenu from "@/components/FlowingMenu";
import SATraditional from "@/components/SATraditional";
import LuxuryCollection from "@/components/LuxuryCollection";
import Chair from "@/components/Chair";
import Gallery from "@/components/Gallery";
import VisitReserve from "@/components/VisitReserve";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />

      {/* Sections 2→4: daylight terrace, the transition, night. */}
      <DayToNight>
        <Heritage />

        {/*
         * Section 3 — "The transition." Holds no copy, on purpose: it is the
         * stretch the day-to-night interpolation runs across, so the ground is
         * free to pass through dusk without dragging any text through mid-grey.
         * What fills it is self-lit and carries no contrast obligation — the
         * venue's ceiling, resolving as night falls. See DuskStars / DayToNight.
         */}
        <DuskStars />

        <DiningRoom />
      </DayToNight>

      {/* Section 5 — the Flowing Menu navigator, on the settled midnight. */}
      <FlowingMenu />

      {/* Section 6a — SA Traditional Spotlight Cards. */}
      <SATraditional />

      {/* Section 7 — The Luxury Collection, on the Silk background. */}
      <LuxuryCollection />

      {/* Section 8 — The Chair: the teal feature moment. */}
      <Chair />

      {/* Section 9 — Gallery: masonry food photography, Gradual Blur on the edges. */}
      <Gallery />

      {/* Section 10 — Visit / Reserve: address, hours, click-to-call, map, CTA. */}
      <VisitReserve />

      {/* Footer — logo, Facebook, VAT + service-charge notes. */}
      <Footer />
    </main>
  );
}
