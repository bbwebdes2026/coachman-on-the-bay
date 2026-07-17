"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Blur Text (react.bits, adapted to our tokens and type).
 *
 * Reserved for the hero headline — "The Coachman" resolving from blur. Do not
 * use it elsewhere; the motion system allows exactly one Blur Text on the site.
 *
 * The words are split for animation only: the accessible name comes from
 * `aria-label` on the wrapper and the pieces are `aria-hidden`, so a screen
 * reader hears one phrase rather than a stream of fragments.
 */
export default function BlurText({
  text,
  className,
  stagger = 0.14,
  delay = 0.1,
}: {
  text: string;
  className?: string;
  /** Seconds between words. */
  stagger?: number;
  /** Seconds before the first word starts. */
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const words = text.split(" ");

  // Motion off: render the text plainly. Nothing to resolve, nothing to wait for.
  if (reduced) return <span className={className}>{text}</span>;

  return (
    <span className={className} aria-label={text}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          aria-hidden
          className="inline-block whitespace-pre will-change-[filter,transform,opacity]"
          initial={{ filter: "blur(16px)", opacity: 0, y: "0.08em" }}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          transition={{
            duration: 1.2,
            delay: delay + i * stagger,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {i < words.length - 1 ? `${word} ` : word}
        </motion.span>
      ))}
    </span>
  );
}
