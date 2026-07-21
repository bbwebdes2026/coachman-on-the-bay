/**
 * Gradual Blur (react.bits / the progressive-blur technique), adapted to tokens.
 *
 * A stack of absolutely-positioned layers, each with a slightly stronger
 * backdrop-blur and a mask that reveals only a moving band. Stacked, the total
 * blur ramps smoothly from clear (inner edge) to fully blurred (the container
 * edge) instead of the hard cut-off a single backdrop-filter gives. Used on the
 * top and bottom edges of the food gallery so the masonry dissolves into the
 * midnight rather than ending on a ruled line — which also lets the weaker crops
 * fade out of scrutiny (see CLAUDE.md §Image pipeline: the design hides remaining
 * quality limits behind Gradual Blur on gallery edges).
 *
 * Purely decorative (aria-hidden) and static — no JS, no animation — so it ships
 * zero client cost and is inherently safe under prefers-reduced-motion. `height`
 * (and any inset tweaks) come from the caller via `className`.
 */
const LAYER_COUNT = 6;

export default function GradualBlur({
  position,
  className = "",
}: {
  position: "top" | "bottom";
  className?: string;
}) {
  // Blur is strongest at the outer edge: "to top" ramps toward the top edge,
  // "to bottom" toward the bottom edge.
  const dir = position === "top" ? "to top" : "to bottom";

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 z-20 ${
        position === "top" ? "top-0" : "bottom-0"
      } ${className}`}
    >
      {Array.from({ length: LAYER_COUNT }).map((_, i) => {
        // 0.5 → 16px across six layers; the exponential ramp is what reads as a
        // continuous gradient rather than six visible steps.
        const blur = 0.5 * 2 ** i;
        // Each layer's mask is a band shifted 12.5% further toward the edge, so
        // successive (blurrier) layers own successively outer slices.
        const a = i * 12.5;
        const mask = `linear-gradient(${dir}, rgba(0,0,0,0) ${a}%, #000 ${
          a + 12.5
        }%, #000 ${a + 25}%, rgba(0,0,0,0) ${a + 37.5}%)`;

        return (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              backdropFilter: `blur(${blur}px)`,
              WebkitBackdropFilter: `blur(${blur}px)`,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        );
      })}
    </div>
  );
}
