# CLAUDE.md — The Coachman Restaurant ("Coachman on the Bay")

## What this project is

A showcase-calibre marketing site for The Coachman Restaurant, a long-standing fine-dining
institution on the beachfront in Gqeberha (Port Elizabeth), South Africa. The site is a
portfolio piece and client pitch: the bar is "award-worthy design-team effort", not
"solid agency template". Think Awwwards submission, not brochureware.

Brand facts: est. fine-dining steakhouse & seafood restaurant on the bay; famous teal
tufted "Coachman chair"; blackletter horse-and-carriage logo; deep-navy interior with
electric-blue LED ceiling coves and warm amber starlight downlights; bright coastal
terrace with white umbrellas overlooking the sea. Contact: 041 584 0087 · www.tcr.co.za ·
facebook.com/coachmanonthebay.

## Stack (do not substitute)

- Next.js 14+, App Router, TypeScript
- Tailwind CSS (tokens below wired into the config)
- Lenis (smooth scroll, site-wide)
- GSAP + ScrollTrigger (scroll choreography)
- Framer Motion (micro-interactions, element transitions)
- react.bits components (install individually via their CLI/copy-paste; adapt to tokens)
- Sharp (image pipeline, build-time script)
- Deploy target: Vercel

## Assets

- Raw assets live in `/assets-raw` (photography, logo, menu images). NEVER use them
  directly in the app.
- The image pipeline (see below) writes processed, web-ready images to `/public/images`.
  All components consume only `/public/images` via `next/image` with explicit `sizes`.
- Menu images in `/assets-raw` are the source of truth for menu content. Transcribe them
  once into typed data at `/data/menu.ts` (categories, items, descriptions, prices in
  Rand, wine pairing notes). Render all menu UI from this data — no menu screenshots in
  the UI. Note "S.Q." items (subject to quotation) and the 10% service-charge line for
  tables of six or more; include the footer line "All prices inclusive of VAT."

## Design tokens

Colors (Tailwind names → hex):

- `midnight`  #0A1220 — base background (night sections)
- `navy-800`  #101B2E — raised surfaces, cards
- `cove`      #2E8BFF — signature accent: the LED cove blue. Links, active states, glows
- `silver-100` #E6EAEF and `silver-400` #9AA3AE — chrome gradient endpoints for metallic
  text/rules (matches the brushed-metal wall logo)
- `amber`     #D9954A — warmth. Reserved for primary CTAs ("Reserve a table") and
  candle/starlight glow accents
- `teal`      #0F7C7A — the Coachman chair. Used in EXACTLY two places: the chair feature
  moment, and interactive hover states. Nowhere else
- `coast-50`  #F4F7F9 and `coast-300` #A8CDE0 — daylight terrace section only

Rules: amber is the only CTA colour. Teal scarcity is deliberate — do not let it leak.
Night sections sit on `midnight`; the terrace section is the only light-background zone.

Typography:

- Display: Cormorant Garamond (Google Fonts) — headings, dish names, large numerals.
  Use optical sizes generously; tight leading on display sizes.
- Body/UI: Hanken Grotesk (Google Fonts) — body copy, menu descriptions, nav, buttons.
- Logo: supplied image/SVG only. NEVER set live text in blackletter/Old English.
- Menu pattern: serif dish name + right-aligned price in tabular figures; sans
  description below. Prices formatted "R285", "R1 345" (space as thousands separator,
  as on the printed menu).
- Type scale: 12 / 14 / 16 / 20 / 28 / 40 / 64 / 96. Body 16. Hero display 96 desktop,
  clamp down to 40 mobile.

## Motion system

Global: Lenis smooth scroll on every page. `prefers-reduced-motion` disables all
scroll-triggered animation and Lenis inertia — content must be fully readable with
motion off.

One coherent language, few effects, used precisely:

1. **Day-to-night scroll narrative (the structural signature).** The homepage opens on
   the daylight terrace (coast tokens) and, as the user scrolls into the dining and
   cellar sections, GSAP ScrollTrigger interpolates the page background through dusk
   into `midnight`, while amber accents fade up. One continuous timeline, scrubbed to
   scroll. This is the site's signature — invest here first.
2. **Blur Text (react.bits)** — hero headline only: "The Coachman" resolving from blur.
3. **Scroll Reveal (react.bits)** — the heritage/story paragraph, word-by-word.
4. **Shiny Text (react.bits)** — metallic silver sweep on section headings, slow and
   subtle (chrome, not glitter).
5. **Flowing Menu (react.bits)** — the menu-section navigator (see Menu section).
6. **Silk background (react.bits)** — Luxury Collection section ONLY. Slow midnight-navy
   silk shader. Lazy-load it; never render on mobile if it costs frame rate — fall back
   to a static gradient.
7. **Gradual Blur (react.bits)** — edges of the food-photography gallery/rails.
8. **Spotlight Card (react.bits)** — SA Traditional Dishes cards.

Do NOT add typewriter effects, floating text, parallax-everything, or any effect not
listed. Restraint is the brief. Hover micro-interactions via Framer Motion: subtle
(scale 1.02, 200–300ms, ease-out), teal-tinted where interactive.

## Page structure (homepage, in order)

1. **Hero — "Arrival."** Full-bleed terrace/bay photograph, daylight. Logo mark small,
   top-left. "The Coachman" in Blur Text, subline "Fine dining on the bay — Gqeberha".
   Amber CTA: "Reserve a table". Scroll cue.
2. **Heritage strip.** Short story paragraph (Scroll Reveal): the institution, the years,
   the bay. One archival-feeling interior photo, duotone treatment.
3. **The transition.** The day-to-night background interpolation happens across sections
   2→4.
4. **The Dining Room — night.** Interior photography (LED coves, starlight ceiling).
   Copy about the room and the charcoal grill. This is where `cove` blue starts glowing.
5. **The Menu — Flowing Menu navigator.** Six rows: Starters / Seafood / Charcoal Grill /
   South African Traditional / Coachman's Burgers / Wine Cellar. Hover reveals a flowing
   image strip of that category. Each row links to the menu page anchor.
6. **SA Traditional Dishes.** Four Spotlight Cards — Springbok, Ostrich, Oxtail, Eisbein —
   each with price and its printed wine-pairing note ("Best served with …"). This content
   differentiates the restaurant for international visitors; use the real pairing copy
   from `/data/menu.ts`.
7. **The Luxury Collection.** Silk background. The premium red-wine tier (Meerlust
   Rubicon R985 down to Beyerskloof Pinotage Reserve R365) as an elegant list — serif
   names, silver rules, tasting notes in body sans.
8. **The Chair.** Full-width feature moment for the notorious teal Coachman chair.
   This is one of the two permitted teal usages — let the photograph carry it, minimal
   copy ("Every institution has a throne." or similar, keep it confident and short).
9. **Gallery.** Masonry of food photography (prawns, oysters, T-bone, seafood pasta)
   with Gradual Blur on container edges.
10. **Visit / Reserve.** Address, hours, phone (041 584 0087) as click-to-call, map
    embed or stylised map, amber CTA repeated. Footer: logo, Facebook link, "All prices
    inclusive of VAT", service-charge note.

Menu page (`/menu`): full transcribed menu from `/data/menu.ts`, anchored categories
matching the Flowing Menu rows, including Sauces, Traveling Lites, Desserts, Coffee, and
the full wine list (Champagne → Cap Classique → Sparkling → house wines → whites → reds →
Luxury Collection → Port/Sherry) plus the bar list. Same type pattern throughout.

## Image pipeline (build FIRST, before any UI)

Create `scripts/enhance-images.mjs`, runnable via `npm run images`:

1. **Upscale pass (free, local).** Download the `realesrgan-ncnn-vulkan` release binary
   for the current OS into `scripts/bin` (gitignored). For every image in `/assets-raw`
   below ~1600px on its long edge, upscale 2–4x with the general photo model. Skip files
   already processed (track by content hash in a small manifest JSON). CPU fallback is
   acceptable — this runs rarely.
2. **Grade pass (Sharp).** Apply one shared grade to ALL photography so the library reads
   as a single shoot: gentle S-curve, shadows tinted toward navy (blend `midnight` at low
   opacity in darks), +5 warmth in highlights, mild saturation lift on food shots only.
3. **Duotone variants.** For flagged weaker interior shots, output an additional
   navy/silver duotone version (`*-duo.jpg`) for use in the heritage strip and any
   background contexts.
4. **Output.** Write web-ready assets to `/public/images` in original + AVIF/WebP where
   beneficial, max 2400px long edge, quality ~80. Keep a `manifest.json` mapping raw →
   processed files.

The design intentionally hides remaining quality limitations: dark scrims over photos,
tighter crops instead of full-bleed where an image is weak, Gradual Blur on gallery
edges, duotone as deliberate art direction.

## Quality floor (non-negotiable)

- Lighthouse: 90+ performance on the homepage, mobile. The Silk shader and GSAP scenes
  must be code-split/lazy; no layout shift from images (always set dimensions).
- Fully responsive to 360px. The day-to-night narrative must work on mobile (simplify,
  don't remove).
- Keyboard focus visible (cove-blue focus rings), semantic landmarks, alt text on all
  photography (describe the dish/room, not "image of").
- `prefers-reduced-motion` respected everywhere.
- Real content only: menu data from the transcription, real phone/address. No lorem
  ipsum anywhere, ever.

## Build order

1. Scaffold + tokens + fonts + Lenis baseline. Commit.
2. Image pipeline script; run it; commit manifest (not the binary).
3. Menu transcription → `/data/menu.ts`. Commit.
4. Hero + heritage + day-to-night ScrollTrigger timeline (the signature — get this right
   before anything else). Commit.
5. Flowing Menu section + menu page. Commit.
6. SA Traditional cards, Luxury Collection (Silk), Chair feature. Commit.
7. Gallery, Visit/Reserve, footer. Commit.
8. Performance + accessibility pass against the quality floor. Commit.

Work one step per session. After each step, run the dev server, and self-review against
this document before moving on.

## First prompt to paste into Claude Code

"Read CLAUDE.md fully. Execute build-order step 1: scaffold Next.js 14 with App Router,
TypeScript and Tailwind in this repo (keep /assets-raw and CLAUDE.md intact), wire the
design tokens and both Google Fonts into the Tailwind config and root layout, add Lenis
smooth scrolling with a prefers-reduced-motion guard, and set up a minimal midnight-navy
placeholder homepage that proves tokens and fonts render. Then commit."
