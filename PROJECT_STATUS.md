# PROJECT STATUS — The Coachman on the Bay

> Maintained by Claude Code. Updated at the end of every working block.
> Last updated: 2026-07-18 (session 6 — audit + quick-win fixes)

## Current state (one paragraph)

Steps 1–5 of the CLAUDE.md build order are complete and pushed to `origin/main`
(latest commit `540d37b`). The homepage renders end-to-end from the top: Hero
("Arrival"), Heritage strip, the signature day-to-night ScrollTrigger background
narrative (with the dusk-band starfield filling the transition), the Dining Room
night section, and the Flowing Menu navigator. The full `/menu` page is live and
server-rendered from the typed transcription in `/data/menu.ts` (296 items, all
eight categories anchored to match the navigator rows). Tokens, both Google Fonts,
Lenis smooth scroll, and the Sharp/Real-ESRGAN image pipeline are all wired.
Nothing is deployed to Vercel yet — everything runs on the local dev server.
Homepage sections 6–10 (SA Traditional cards, Luxury Collection, the Chair,
Gallery, Visit/Reserve) are not yet built.

## Section tracker

| Section | Status | Notes |
|---|---|---|
| Hero / Home | in progress | Hero, Heritage, day-to-night narrative, Dining Room, Flowing Menu done; sections 6–10 (SA cards, Luxury/Silk, Chair, Gallery, Visit/Reserve) not started |
| About | done | Heritage strip — Scroll Reveal story paragraph + duotone interior photo |
| Menu — Starters & Mains | done | Rendered on `/menu` from `data/menu.ts`; homepage cards N/A |
| Menu — Seafood & Grill | done | Rendered on `/menu` (Seafood + Charcoal Grill categories) |
| Menu — Burgers | done | Rendered on `/menu` |
| Menu — SA Traditional Dishes | in progress | Full listing done on `/menu`; homepage Spotlight Cards (step 6) not started |
| Menu — Wine List & Luxury Collection | in progress | Full wine list + Luxury Collection listing done on `/menu`; homepage Silk-background section (step 6) not started |
| Menu — Bar & Drinks | done | Rendered on `/menu` |
| Gallery | not started | Step 7 — masonry food photography + Gradual Blur edges |
| Contact / Booking / Map | not started | Step 7 — Visit/Reserve: address, hours, click-to-call, map, amber CTA |
| Footer + global nav | in progress | `/menu` footer done (VAT + service-charge + phone); homepage footer + global nav not built |
| SEO / schema / OpenGraph | done | `Restaurant` JSON-LD + full OpenGraph/Twitter/canonical + favicon (`app/icon.png`) shipped; `openingHoursSpecification` TODO pending owner hours |

Status meanings: **done** = built and self-QA passed; **reviewed** = owner approved at checkpoint.

## Quality gates (latest run)

Mobile Lighthouse 13.4.0 against the production build, **post quick-win fixes**. Full
detail (incl. original baseline) in QUALITY_AUDIT.md.

| Gate | Result | Date |
|---|---|---|
| Lighthouse — Performance | home **85** ❌ (first-load JS / LCP — step-8 debt) · menu 90 ✅ | 2026-07-18 |
| Lighthouse — Accessibility | home 95 ✅ · menu 100 ✅ | 2026-07-18 |
| Lighthouse — Best Practices | home 100 ✅ · menu 100 ✅ (favicon added, console clean) | 2026-07-18 |
| Lighthouse — SEO | home 100 · menu 100 ✅ | 2026-07-18 |
| WCAG AA contrast (all pages) | mostly pass — hero `aria-label` & menu `tel:` link fixed; remaining: 65 Scroll-Reveal words dim mid-animation at scroll-top (transient; motion-off renders full-contrast) | 2026-07-18 |
| Responsive 360 / 768 / 1440 | pass — CLS 0, no horizontal overflow either page | 2026-07-18 |
| Images WebP/AVIF + lazy | pass — all via `next/image`, format-negotiated WebP/AVIF; no raw JPEG shipped | 2026-07-18 |
| JSON-LD + OpenGraph valid | pass — `Restaurant` JSON-LD + full OG/Twitter/canonical + favicon; `openingHoursSpecification` TODO (owner hours) | 2026-07-18 |

## In progress

Nothing actively mid-edit. Step 5 (Flowing Menu + `/menu`) was the last completed
and approved block. Step 6 is the next to start: SA Traditional Spotlight Cards,
the Luxury Collection section with the Silk react.bits background (lazy-loaded,
static-gradient fallback on mobile), and the Chair feature (one of only two
sanctioned teal usages).

## Decisions log

<!-- Append-only. One line per decision, newest first. -->
2026-07-18 — Applied audit quick wins 1–5: favicon (`app/icon.png`/`apple-icon.png`), full OG + `og-image.jpg` social card, `Restaurant` JSON-LD, menu `tel:` underline, hero `aria-label`→`<h1>`. Best Practices→100 both; A11y home 91→95, menu 96→100; console 404 cleared. `openingHoursSpecification` still owed by owner.
2026-07-18 — Ran initial quality audit (Lighthouse/axe/Playwright) → QUALITY_AUDIT.md; artifacts in /audit. Cross-cutting gaps: JSON-LD, OG image, favicon.
2026-07-18 — Added PROJECT_STATUS.md as the running status ledger.
2026-07-17 — Dusk transition band filled with a scroll-resolved starfield quoting the venue's LED ceiling (self-lit, carries no contrast obligation).
2026-07-17 — Day-to-night transition starts at `top 17%` / progress spent to the AA contrast floor (5.97:1); copy never fades below AA.
2026-07-17 — `/menu` is fully server-rendered from `data/menu.ts` (zero menu JS); menu scans retired as UI, kept only as transcription source of truth.
2026-07-17 — Prices use an NBSP thousands separator (e.g. "R1 345") to prevent wrap, matching the printed menu.
2026-07-17 — Shiny Text heading sweep stubbed by a static `.text-chrome` gradient; animated component deferred to step 8 polish.

## Blockers / needs owner input

- **Real vector logo** — current `coachman-mark.png` is keyed out of a beach marketing graphic; a workaround, not a final asset. Need the supplied SVG/vector mark.
- **Founding year** — heritage copy is deliberately date-free; nothing in the assets states a founding year. Confirm the year (or confirm we stay date-free).
- **3rd interior image** ("sticks out") — Gareth flagged `seating-area2` reads inconsistently against the graded set; decide whether to duotone/regrade or drop it.
- **Deploy target** — Vercel project not yet created/connected; domain (`tcr.co.za`?) and hosting to confirm before launch.
- **Trading hours** — needed to complete the `Restaurant` JSON-LD `openingHoursSpecification` (currently a marked TODO in `app/layout.tsx`).
- **Social card** — `public/og-image.jpg` is a logo-on-midnight card; confirm whether to swap in a terrace/hero photo composition.

## Next up

**Step 6** — SA Traditional Spotlight Cards (Springbok / Ostrich / Oxtail /
Eisbein, each with its printed wine pairing from `saTraditionalDishes`); the
Luxury Collection homepage section with the Silk react.bits background; and the
Chair feature moment. Begin after checkpoint approval.
