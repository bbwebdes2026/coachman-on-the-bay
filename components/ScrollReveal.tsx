"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";

/**
 * Scroll Reveal (react.bits, adapted). Words resolve as the paragraph is
 * scrubbed through. Reserved for the heritage/story paragraph.
 *
 * Progressive enhancement: the words render at full opacity in the markup and
 * GSAP dims them only once it takes over, so the paragraph stays readable with
 * JS disabled, with motion reduced, or before hydration.
 */
export default function ScrollReveal({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (reduced || !el) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll("[data-word]"),
        { opacity: 0.18, filter: "blur(5px)" },
        {
          opacity: 1,
          filter: "blur(0px)",
          ease: "none",
          stagger: 0.35,
          scrollTrigger: {
            trigger: el,
            start: "top 82%",
            end: "bottom 62%",
            scrub: 0.5,
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  if (reduced) return <p className={className}>{text}</p>;

  return (
    <p ref={ref} className={className}>
      {text.split(" ").map((word, i) => (
        <span key={`${word}-${i}`} data-word className="inline-block whitespace-pre">
          {word}{" "}
        </span>
      ))}
    </p>
  );
}
