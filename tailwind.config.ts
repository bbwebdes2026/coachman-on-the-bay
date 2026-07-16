import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Night sections
        midnight: "#0A1220", // base background (night sections)
        "navy-800": "#101B2E", // raised surfaces, cards
        // Signature accent — the LED cove blue
        cove: "#2E8BFF", // links, active states, glows
        // Chrome gradient endpoints (brushed-metal wall logo)
        "silver-100": "#E6EAEF",
        "silver-400": "#9AA3AE",
        // Warmth — CTAs and candle/starlight glow ONLY
        amber: "#D9954A",
        // The Coachman chair — EXACTLY two uses (chair moment + interactive hover)
        teal: "#0F7C7A",
        // Daylight terrace section only
        "coast-50": "#F4F7F9",
        "coast-300": "#A8CDE0",
      },
      fontFamily: {
        // Display: headings, dish names, large numerals
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        // Body/UI: body copy, menu descriptions, nav, buttons
        sans: ["var(--font-hanken)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Type scale: 12 / 14 / 16 / 20 / 28 / 40 / 64 / 96
        xs: ["0.75rem", { lineHeight: "1.4" }], // 12
        sm: ["0.875rem", { lineHeight: "1.45" }], // 14
        base: ["1rem", { lineHeight: "1.6" }], // 16
        lg: ["1.25rem", { lineHeight: "1.45" }], // 20
        xl: ["1.75rem", { lineHeight: "1.25" }], // 28
        "2xl": ["2.5rem", { lineHeight: "1.15" }], // 40
        "3xl": ["4rem", { lineHeight: "1.05" }], // 64
        "4xl": ["6rem", { lineHeight: "1.0" }], // 96
      },
    },
  },
  plugins: [],
};

export default config;
