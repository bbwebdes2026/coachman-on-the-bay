# PROJECT STATUS — The Coachman on the Bay

> Maintained by Claude Code. Updated at the end of every working block.
> Last updated: 2026-07-19 (session 7 — 6a reviewed + fix checkpoint)

## Current state (one paragraph)

Steps 1–5 of the CLAUDE.md build order are complete and pushed to `origin/main`
(latest commit `540d37b`). The homepage renders end-to-end from the top: Hero
("Arrival"), Heritage strip, the signature day-to-night ScrollTrigger background
narrative (with the dusk-band starfield filling the transition), the Dining Room
night section, and the Flowing Menu navigator. The full `/menu` page is live and
server-rendered from the typed transcription in `/data/menu.ts` (296 items, all
eight categories anchored to match the navigator rows). Tokens, both Google Fonts,
Lenis smooth scroll, and the Sharp/Real-ESRGAN image pipeline are all wired.
A preview deployment is live on Vercel at `coachman-on-the-bay.vercel.app`
(production domain not yet decided). Homepage sections 6b–10 (Luxury Collection,
the Chair, Gallery, Visit/Reserve) are not yet built.

## Section tracker

| Section | Status | Notes |
|---|---|---|
| Hero / Home | in progress | Hero, Heritage, day-to-night narrative, Dining Room, Flowing Menu, **SA Traditional cards (6a)** done; remaining: Luxury/Silk (6b), Chair, Gallery, Visit/Reserve |
| About | done | Heritage strip — Scroll Reveal story paragraph + duotone interior photo |
| Menu — Starters & Mains | done | Rendered on `/menu` from `data/menu.ts`; homepage cards N/A |
| Menu — Seafood & Grill | done | Rendered on `/menu` (Seafood + Charcoal Grill categories) |
| Menu — Burgers | done | Rendered on `/menu` |
| Menu — SA Traditional Dishes | reviewed | Owner-approved 2026-07-19. Homepage Spotlight Cards (6a) — 4 dishes + wine pairings from `saTraditionalDishes`, cove spotlight, reduced-motion fallback. Fix checkpoint: Optima note typos corrected, pairing wine now links to `/menu#wine-cellar` |
| Menu — Wine List & Luxury Collection | in progress | Full wine list + Luxury Collection listing done on `/menu`; homepage Silk-background section (step 6) not started |
| Menu — Bar & Drinks | done | Rendered on `/menu` |
| Gallery | not started | Step 7 — masonry food photography + Gradual Blur edges |
| Contact / Booking / Map | not started | Step 7 — Visit/Reserve: address, hours, click-to-call, map, amber CTA |
| Footer + global nav | in progress | `/menu` footer done (VAT + service-charge + phone); homepage footer + global nav not built |
| SEO / schema / OpenGraph | done | `Restaurant` JSON-LD (incl. `openingHoursSpecification`, applied 2026-07-18) + full OpenGraph/Twitter/canonical + favicon (`app/icon.png`) shipped |

Status meanings: **done** = built and self-QA passed; **reviewed** = owner approved at checkpoint.

## Quality gates (latest run)

Mobile Lighthouse 13.4.0 against the production build, **post quick-win fixes**. Full
detail (incl. original baseline) in QUALITY_AUDIT.md.

| Gate | Result | Date |
|---|---|---|
| Lighthouse — Performance | home **85** ❌ (first-load JS / LCP — step-8 debt) · menu 90 ✅ | 2026-07-18 |
| Lighthouse — Accessibility | home 96 ✅ · menu 100 ✅ | 2026-07-18 |
| Lighthouse — Best Practices | home 100 ✅ · menu 100 ✅ (favicon added, console clean) | 2026-07-18 |
| Lighthouse — SEO | home 100 · menu 100 ✅ | 2026-07-18 |
| WCAG AA contrast (all pages) | mostly pass — hero `aria-label` & menu `tel:` link fixed; remaining: 65 Scroll-Reveal words dim mid-animation at scroll-top (transient; motion-off renders full-contrast) | 2026-07-18 |
| Responsive 360 / 768 / 1440 | pass — measured `docScroll==viewport` at all three widths, CLS 0 (caught + fixed a 6a heading overflow at 360) | 2026-07-18 |
| Images WebP/AVIF + lazy | pass — all via `next/image`, format-negotiated WebP/AVIF; no raw JPEG shipped | 2026-07-18 |
| JSON-LD + OpenGraph valid | pass — `Restaurant` JSON-LD (foundingDate, full address, openingHoursSpecification) + `Menu` node on /menu + full OG/Twitter/canonical + favicon | 2026-07-18 |

## In progress

Step 6a (SA Traditional Spotlight Cards) owner-reviewed and approved 2026-07-19; a small
fix checkpoint (Optima tasting-note typos, pairing-line cross-link) is in. Next is **6b —
the Luxury Collection** section with the Silk react.bits background (lazy-loaded,
static-gradient fallback on mobile), then the Chair feature (one of only two sanctioned
teal usages).

## Decisions log

<!-- Append-only. One line per decision, newest first. -->
2026-07-19 — 6a fix checkpoint: corrected the Optima tasting note ("intergrated"→"integrated", SA-dishes "mouthful"→"mouthfeel" to match its Luxury Collection entry — both owner-sanctioned); SA card pairing wine is now a `/menu#wine-cellar` link with a persistent cove underline (audit rule for cove inline text on grey). Reconciled stale docs: `openingHoursSpecification` marked done (was applied 2026-07-18), preview deploy noted live.
2026-07-18 — Built step 6a: SA Traditional Spotlight Cards (`SATraditional.tsx`) — 4 dishes + pairings straight from `saTraditionalDishes`, cove cursor-spotlight (react.bits adapted), reduced-motion → static cove border, keyboard-focusable (focus lights the glow). Card content passes AA on navy-800; home A11y 95→96, no perf/console regression.
2026-07-18 — Owner-confirmed content facts applied: founded 1978 (Heritage copy), address Brookes on the Bay/Summerstrand/Gqeberha 6001, hours Mon–Sat 11:30–22:00 / Sun 11:30–21:00. JSON-LD refactored to a typed module (`data/restaurant.ts`) + `<JsonLd>`; `Restaurant` node site-wide, `Menu` node on /menu.
2026-07-18 — Applied audit quick wins 1–5: favicon (`app/icon.png`/`apple-icon.png`), full OG + `og-image.jpg` social card, `Restaurant` JSON-LD, menu `tel:` underline, hero `aria-label`→`<h1>`. Best Practices→100 both; A11y home 91→95, menu 96→100; console 404 cleared. `openingHoursSpecification` still owed by owner.
2026-07-18 — Ran initial quality audit (Lighthouse/axe/Playwright) → QUALITY_AUDIT.md; artifacts in /audit. Cross-cutting gaps: JSON-LD, OG image, favicon.
2026-07-18 — Added PROJECT_STATUS.md as the running status ledger.
2026-07-17 — Dusk transition band filled with a scroll-resolved starfield quoting the venue's LED ceiling (self-lit, carries no contrast obligation).
2026-07-17 — Day-to-night transition starts at `top 17%` / progress spent to the AA contrast floor (5.97:1); copy never fades below AA.
2026-07-17 — `/menu` is fully server-rendered from `data/menu.ts` (zero menu JS); menu scans retired as UI, kept only as transcription source of truth.
2026-07-17 — Prices use an NBSP thousands separator (e.g. "R1 345") to prevent wrap, matching the printed menu.
2026-07-17 — Shiny Text heading sweep stubbed by a static `.text-chrome` gradient; animated component deferred to step 8 polish.

## Blockers / needs owner input

**Remaining owner blockers — only these two:**
- **Real vector logo** — current `coachman-mark.png` is keyed out of a beach marketing graphic; a workaround, not a final asset. Need the supplied SVG/vector mark.
- **Production domain + launch config** — preview deployment is live at `coachman-on-the-bay.vercel.app`; the production domain decision (`tcr.co.za`?) and launch configuration remain to confirm before go-live.

**Resolved 2026-07-18 (owner-confirmed):** founding year **1978** (worked into the Heritage copy); street address **Brookes on the Bay, Summerstrand, Gqeberha 6001**; trading hours **Mon–Sat 11:30–22:00 / Sun 11:30–21:00**. All three are now in the `Restaurant` JSON-LD (`data/restaurant.ts`) and `CONTACT` (`data/menu.ts`) for the step-7 footer.

**Open, non-blocking (design calls, no external input needed):**
- 3rd interior image (`seating-area2`) reads inconsistently against the graded set — regrade/duotone or drop.
- Social card `og-image.jpg` is a logo-on-midnight card — optionally swap for a terrace/hero composition.

## Next up

**Step 6b** — the Luxury Collection homepage section with the Silk react.bits
background (lazy-loaded; static-gradient fallback on mobile / low frame rate) — the
premium red-wine tier as an elegant serif list. Then the Chair feature moment. Begin
after 6a checkpoint approval.
