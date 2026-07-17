"use client";

import { useMemo } from "react";

/**
 * The dusk band's content: the venue's own dining-room ceiling — warm
 * fibre-optic points over the blue LED coves (see the interior reference
 * photos) — arriving in the one stretch of the page dark enough to hold it.
 *
 * This is exempt from CLAUDE.md's closed effects list not as a new effect
 * imported for its own sake, but as the restaurant's signature rendered on
 * schedule: the light half of the band is "the light going," the resolved half
 * is "the lights of The Coachman coming on." It turns the band from dead space
 * into the hinge of the day-to-night narrative.
 *
 * It owns no motion of its own. The reveal is driven entirely by DayToNight's
 * existing scrub, which writes --dn-stars-a / --dn-stars-b on <html>; those
 * inherit down here and drive the two layer opacities. With no JS, reduced
 * motion, or before hydration the vars default to 0 and the band falls back to
 * its static gradient — exactly as before.
 */

// Fixed seed: determinism is a hydration requirement, not a style choice. The
// same positions must render on server and client.
const STAR_SEED = 20260717;
const STAR_COUNT = 56;
// Warm white, matched to the ceiling's fibre-optic points. Deliberately not
// pure white — that would read as cold LED, not candle-warm starlight.
const STAR_COLOR = "#F6EAD1";

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Star = { left: number; top: number; size: number; base: number; layer: 0 | 1 };

function makeStars(): Star[] {
  const rnd = mulberry32(STAR_SEED);
  return Array.from({ length: STAR_COUNT }, () => ({
    left: 2 + rnd() * 96, // % of band width
    top: 4 + rnd() * 88, // % of band height
    size: rnd() < 0.72 ? 2 : 3, // px — two size classes only
    base: 0.45 + rnd() * 0.55, // per-star resting opacity once resolved
    layer: rnd() < 0.5 ? 0 : 1, // A resolves first, B fills in behind it
  }));
}

export default function DuskStars() {
  const stars = useMemo(makeStars, []);

  return (
    <div
      data-dn-band
      aria-hidden
      className="dusk-band relative h-[70vh] overflow-hidden"
    >
      <div
        aria-hidden
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        {([0, 1] as const).map((layer) => (
          <div
            key={layer}
            style={{
              position: "absolute",
              inset: 0,
              // Two wrappers means the scrub writes exactly two custom
              // properties per tick; every per-star opacity below is static.
              opacity: `var(--dn-stars-${layer === 0 ? "a" : "b"}, 0)`,
            }}
          >
            {stars
              .filter((s) => s.layer === layer)
              .map((s, i) => (
                <span
                  key={i}
                  style={{
                    position: "absolute",
                    left: `${s.left}%`,
                    top: `${s.top}%`,
                    width: s.size,
                    height: s.size,
                    borderRadius: "50%",
                    background: STAR_COLOR,
                    opacity: s.base,
                  }}
                />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
