# PROJECT STATUS — The Coachman on the Bay

> Maintained by Claude Code. Updated at the end of every working block.
> Last updated: 2026-07-21 (session 8 — step 7: Gallery, Visit/Reserve, Footer — step 7 complete)

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
(production domain not yet decided). Build-order **step 6 is now complete** — the
homepage renders from Hero through the SA Traditional cards, the Luxury Collection
(Silk background) and **The Chair** (the teal feature moment). Build-order
**step 7 is now complete** — the homepage runs end-to-end: the Gallery (masonry
food photography with Gradual Blur on the container edges), the Visit/Reserve
section (address + hours from `CONTACT`, click-to-call, stylised map, amber CTA)
and the homepage footer (logo, Facebook, service-charge + VAT notes). Remaining
work is step 8: the performance + accessibility pass to the quality floor.

## Section tracker

| Section | Status | Notes |
|---|---|---|
| Hero / Home | done | Hero, Heritage, day-to-night narrative, Dining Room, Flowing Menu, SA Traditional cards (6a), Luxury Collection + Silk (6b), The Chair (6c), **Gallery + Visit/Reserve + Footer (step 7)** all built; step 8 perf/a11y pass remains |
| About | done | Heritage strip — Scroll Reveal story paragraph + duotone interior photo |
| Menu — Starters & Mains | done | Rendered on `/menu` from `data/menu.ts`; homepage cards N/A |
| Menu — Seafood & Grill | done | Rendered on `/menu` (Seafood + Charcoal Grill categories) |
| Menu — Burgers | done | Rendered on `/menu` |
| Menu — SA Traditional Dishes | reviewed | Owner-approved 2026-07-19. Homepage Spotlight Cards (6a) — 4 dishes + wine pairings from `saTraditionalDishes`, cove spotlight, reduced-motion fallback. Fix checkpoint: Optima note typos corrected, pairing wine now links to `/menu#wine-cellar` |
| Menu — Wine List & Luxury Collection | done | Full wine list + Luxury Collection on `/menu`; homepage Silk-background section (6b) shipped — 10 premium reds from `luxuryCollection`, WebGL silk (lazy `ogl` chunk, ≥768px + motion-on + in-view only), static-gradient fallback for mobile/reduced-motion/SSR |
| Menu — Bar & Drinks | done | Rendered on `/menu` |
| Gallery | done | `Gallery.tsx` — CSS multi-column masonry of the 5 graded food shots + `GradualBlur.tsx` (react.bits progressive-blur, 6 masked backdrop-blur layers) on the top/bottom edges; server component, 0 client JS, per-dish alt text |
| Contact / Booking / Map | done | `VisitReserve.tsx` (`id="visit"`) — address + hours from `CONTACT`, click-to-call, amber "Reserve a table" CTA (call = the reservation), stylised in-brand SVG map with Google Maps "Get directions" hand-off (no third-party iframe, protects perf/BP budget) |
| Footer + global nav | in progress | homepage `Footer.tsx` done (logo, contact, Explore links incl. Facebook, service-charge + VAT notes); `/menu` footer done; global nav still not built |
| SEO / schema / OpenGraph | done | `Restaurant` JSON-LD (incl. `openingHoursSpecification`, applied 2026-07-18) + full OpenGraph/Twitter/canonical + favicon (`app/icon.png`) shipped |

Status meanings: **done** = built and self-QA passed; **reviewed** = owner approved at checkpoint.

## Quality gates (latest run)

Mobile Lighthouse 13.4.0 against the production build, **post quick-win fixes**. Full
detail (incl. original baseline) in QUALITY_AUDIT.md.

| Gate | Result | Date |
|---|---|---|
| Lighthouse — Performance | home **90** ✅ (94→90 with the 5-image lazy gallery; step-7 sections are all 0 client JS) · menu 90 ✅ | 2026-07-21 |
| Lighthouse — Accessibility | home 96 ✅ · menu 100 ✅ | 2026-07-21 |
| Lighthouse — Best Practices | home 100 ✅ · menu 100 ✅ | 2026-07-21 |
| Lighthouse — SEO | home 100 · menu 100 ✅ | 2026-07-21 |
| WCAG AA contrast (all pages) | pass — axe in the true midnight state = 1 violation, the pre-existing `Heritage` figcaption (opacity-50 over duotone); step-7 Gallery/Visit/Footer contribute 0. New token pairs all ≥ AA (dimmest 5.09:1). The huge Lighthouse contrast list is the known day-to-night scroll-top artifact (`dn-active` makes night sections transparent over the day bg) | 2026-07-21 |
| Responsive 360 / 768 / 1440 | pass — `docScroll==viewport` at all three widths across the new Gallery/Visit/Footer (masonry collapses 3→2→1 col; Visit + Footer grids stack cleanly on mobile) | 2026-07-21 |
| Images WebP/AVIF + lazy | pass — all via `next/image`, format-negotiated WebP/AVIF; no raw JPEG shipped | 2026-07-18 |
| JSON-LD + OpenGraph valid | pass — `Restaurant` JSON-LD (foundingDate, full address, openingHoursSpecification) + `Menu` node on /menu + full OG/Twitter/canonical + favicon | 2026-07-18 |

## In progress

Step 7 (Gallery, Visit/Reserve, Footer) complete and awaiting review — this closes out
the homepage sections. Next is **step 8**: the performance + accessibility pass to the
quality floor (and the deferred debts — npm audit, first-load JS code-split, animated
Shiny Text).

## Decisions log

<!-- Append-only. One line per decision, newest first. -->
2026-07-21 — Built step 7: Gallery (`Gallery.tsx` + `GradualBlur.tsx`), Visit/Reserve (`VisitReserve.tsx`) and homepage Footer (`Footer.tsx`), all server components (0 client JS; home First Load JS unchanged at 201 kB). Gallery is CSS multi-column masonry (each shot keeps its aspect ratio, explicit dims → no CLS); GradualBlur is the react.bits progressive-blur (6 backdrop-blur layers with shifting masks) on the top + bottom edges, doubling as the "hide weak crops" device from §Image pipeline. Visit uses a stylised in-brand SVG map + Google Maps "Get directions" hand-off rather than a live iframe — keeps the perf/Best-Practices budget and adds no third-party cookies; the amber CTA is the click-to-call since the restaurant takes no online booking. Home Perf 94→90 (5 lazy gallery images), still ≥ floor.
2026-07-19 — Built step 6c: The Chair (`Chair.tsx`) — the full-width teal feature. Teal is carried entirely by the photograph (the tufted chair); no teal leaks into the chrome — eyebrow is deliberately neutral silver (not the site's cove eyebrow) so nothing cool competes with the chair. Split layout, not a wide crop: a tall image panel crops the near-square source's sides, keeping both the gold mark and the chair; copy sits on its own midnight panel (guaranteed contrast). Server component, 0 client JS, static (reduced-motion-safe by construction). Home Perf 92→94; axe 0 on the section.
2026-07-19 — Built step 6b: Luxury Collection (`LuxuryCollection.tsx`) — 10 premium reds from `luxuryCollection` as a serif list (silver rules, tabular prices, sans tasting notes). Silk background ported from react.bits via `ogl` (`Silk.tsx`); added `ogl` dependency (no new vulns — audit debt is pre-existing Next). Silk is gated hard: dynamic `ssr:false` (own lazy chunk), mounts only ≥768px + motion-allowed + in-view; static `.silk-fallback` gradient is the SSR/mobile/reduced-motion base. Verified: canvas mounts 1440/768, absent 360/reduced; home Perf 92, 0 console errors with Silk running; axe 0 on the section.
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

**Step 8** — performance + accessibility pass against the quality floor: Lighthouse 90+
mobile on every changed page (home Perf now sits at the 90 floor — the lazy gallery is
the obvious lever), responsive to 360px, reduced-motion, focus rings, alt text. Also
clears the deferred debts: the npm audit (5 transitive vulns), the ~178 kB first-load JS
(code-split GSAP + Framer Motion), and the animated Shiny Text heading sweep (currently
the static `.text-chrome` stub). Begin after step 7 review approval.
