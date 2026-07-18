# QUALITY AUDIT — The Coachman on the Bay

> **Update 2026-07-18 — quick wins 1–5 applied and re-verified.** The `/audit`
> artifacts below were regenerated post-fix. Resolved: favicon 404 (console now clean,
> Best Practices → **100** both pages), OpenGraph completed (`og:image`/`url`/`site_name`
> /`twitter:image`/canonical), `Restaurant` JSON-LD added (`openingHoursSpecification`
> still a TODO — owner hours owed), menu `tel:` link underlined (`link-in-text-block`
> cleared, menu Accessibility → **100**), hero `aria-label` moved to `<h1>`
> (`aria-prohibited-attr` cleared, home Accessibility 91 → **95**). **Still open:** home
> Performance (85, first-load JS — step-8 debt) and the 65 transient Scroll-Reveal
> contrast flags (documented below as a scroll artifact, not a motion-off failure). The
> tables that follow record the original baseline.
>
> Automated audit run 2026-07-18. Tools: Lighthouse 13.4.0 (mobile emulation),
> axe-core 4.x, Playwright 1.61 (Chromium 1228). Target: production build
> (`next build` + `next start`) on `http://localhost:3100`.
> Pages audited: **/** (home) and **/menu**.
>
> Raw artifacts live under `/audit`: `screenshots/`, `lighthouse/` (full JSON +
> HTML), `accessibility/` (axe violations), `meta/` (JSON-LD/OG + image inventory).

## Summary — gates per page

Gate is **all four Lighthouse categories ≥ 90** plus WCAG AA, image, and schema checks.

| Gate | Home (`/`) | Menu (`/menu`) |
|---|---|---|
| Lighthouse — Performance | **87 ❌** | 92 ✅ |
| Lighthouse — Accessibility | 91 ✅ | 96 ✅ |
| Lighthouse — Best Practices | 96 ✅ | 96 ✅ |
| Lighthouse — SEO | 100 ✅ | 100 ✅ |
| **Lighthouse gate (all ≥90)** | **FAIL** (perf 87) | **PASS** |
| WCAG AA contrast (axe) | **FAIL** — 65 nodes¹ + 1 ARIA | **FAIL** — 1 link² |
| Images WebP/AVIF + lazy | ✅ PASS (all via `next/image`) | ✅ PASS |
| JSON-LD schema present | **FAIL** — none | **FAIL** — none |
| OpenGraph complete | **FAIL** — 3 tags missing | **FAIL** — 3 tags missing |
| Responsive 360/768/1440 | ✅ renders, no overflow³ | ✅ renders, no overflow |
| No console errors | **FAIL** — favicon 404 | **FAIL** — favicon 404 |

¹ All 65 are the Scroll-Reveal heritage words captured mid-animation at scroll-top — see [Accessibility](#accessibility-axe-core). ² A `tel:` link not distinguishable without colour. ³ CLS = 0 on both; no horizontal overflow at any breakpoint.

**Bottom line:** `/menu` clears the Lighthouse gate; `/` misses on Performance (87, LCP-bound). Both pages need the same three cross-cutting fixes — **JSON-LD**, **OpenGraph image/url/site_name**, and a **favicon** — plus two small contrast fixes.

## Lighthouse detail (mobile)

| Metric | Home | Menu |
|---|---|---|
| First Contentful Paint | 1.4 s | 1.5 s |
| Largest Contentful Paint | **3.7 s** (score 0.58) | 3.2 s (0.71) |
| Total Blocking Time | 130 ms | 50 ms |
| Cumulative Layout Shift | 0 | 0 |
| Speed Index | 3.0 s | 2.2 s |
| Time to Interactive | 3.8 s | 3.2 s |

**Home performance drags** (why it's 87): LCP 3.7 s is the gate-breaker. Contributing
audits flagged: `largest-contentful-paint` (0.58), `unused-javascript` (0),
`legacy-javascript` (0.5), `mainthread-work-breakdown` (0), `forced-reflow` (0, from the
GSAP/Lenis scroll loop), `image-delivery` (0.5). The heavy first-load JS (GSAP + Framer
Motion + Lenis, 198 kB) is the root cause — the same ~178 kB debt already logged in
PROJECT_STATUS. Code-splitting the scroll scenes and deferring GSAP is the lever.

Full reports: [`audit/lighthouse/home.report.html`](audit/lighthouse/home.report.html) ·
[`audit/lighthouse/menu.report.html`](audit/lighthouse/menu.report.html) (+ `.json`).

## Screenshots

Full-page captures at each breakpoint (`/audit/screenshots/`):

| | 360 px | 768 px | 1440 px |
|---|---|---|---|
| Home | [home-360](audit/screenshots/home-360.png) | [home-768](audit/screenshots/home-768.png) | [home-1440](audit/screenshots/home-1440.png) |
| Menu | [menu-360](audit/screenshots/menu-360.png) | [menu-768](audit/screenshots/menu-768.png) | [menu-1440](audit/screenshots/menu-1440.png) |

**Methodology caveat (important for reading the home shots):** the homepage theme is
scroll-driven (the day-to-night background interpolation). A static full-page screenshot
freezes the page at scroll position 0, so every section below the hero is captured
against the *daylight* background before it has darkened — the night-section text
therefore looks washed-out in the capture. That is a capture artifact, **not** what a
scrolling user sees; it is also the source of the 65 axe contrast flags below. Verified
manually: as the page scrolls, the background darkens under that text and it resolves to
full contrast.

## Accessibility (axe-core)

Full node lists: [`audit/accessibility/home.json`](audit/accessibility/home.json) ·
[`audit/accessibility/menu.json`](audit/accessibility/menu.json).

### Home — 2 violation types (both `serious`)

**1. `color-contrast` — 65 nodes.** Every node is a `span[data-word="true"]` in the
heritage paragraph (the Scroll-Reveal effect). Sample: foreground `#caced2` on background
`#f4f7f9`, ratio **1.47:1** (needs 3:1 for large text). Root cause: the words animate from
`opacity: 0.18` up to `1` on scroll-scrub; axe measures the DOM at scroll-top, i.e. the
dim pre-reveal state, and against the daylight background that hasn't darkened yet.
- Reduced-motion path is **correct** — `ScrollReveal` renders a plain full-opacity `<p>`
  when `prefers-reduced-motion` is set, and ships the words at full opacity pre-hydration,
  so motion-off users always see AA-legible text.
- Real-world impact is low (transient, below the fold), but it is a genuine transient AA
  dip for motion-on users. **Fix option:** raise the resting opacity floor / pre-reveal
  colour so even the dimmest frame stays ≥ 3:1 on the daylight background, or gate the
  effect so it only dims once its background has begun darkening.

**2. `aria-prohibited-attr` — 1 node.** `<span aria-label="The Coachman">` (the Blur-Text
hero). `aria-label` is not permitted on a `span` with no valid role. **Fix:** put the
accessible name on a real heading element (e.g. an `<h1>` wrapping the effect) or add an
appropriate `role`, and `aria-hidden` the per-letter animation spans so the name is
announced once.

*Incomplete (needs manual review): 7 `color-contrast` — these are the `.text-chrome`
gradient headings (transparent text + `background-clip`, which axe cannot compute) and
text over photographs. Verified by eye: silver on midnight, legible.*

### Menu — 1 violation type (`serious`)

**`link-in-text-block` — 1 node.** `<a href="tel:+27415840087" class="text-cove
hover:underline">041 584 0087</a>` in the footer. The `cove` link colour (`#2e8bff`) has
only **1.31:1** contrast against the surrounding `#9aa3ae` body text and carries no
underline at rest (underline is hover-only), so it isn't distinguishable without colour.
**Fix:** give the link a persistent underline (or a ≥3:1 distinction from the surrounding
text). Applies anywhere a `cove` inline link sits inside grey body copy.

*Incomplete: 10 `color-contrast` — same `.text-chrome`/over-image cases; manually OK.*

## Image formats & lazy-loading

**Result: PASS on both pages.** Every rendered image goes through `next/image`, which
serves format-negotiated **WebP/AVIF** from `/_next/image` (no raw JPEG/PNG is shipped to
the browser). Inventory: [`audit/meta/home-images.json`](audit/meta/home-images.json) ·
[`audit/meta/menu-images.json`](audit/meta/menu-images.json).

| Page | `<img>` count | Delivered format | Eager (above-fold) | Missing alt | Missing dims |
|---|---|---|---|---|---|
| Home | 4 | all next-optimized (WebP/AVIF) | 2 (hero `terrace-bay`, logo mark — both `fetchpriority=high`, correct) | 0 | 1 |
| Menu | 1 | next-optimized | 1 (logo mark, priority) | 0 | 0 |

**Image conversion tasks:** none — source `.jpg`/`.png` in `/assets-raw` → `/public/images`
is intentional (the pipeline keeps originals; Next negotiates modern formats at request
time). No files need manual WebP/AVIF conversion.

**Minor image note (not a gate failure):**
- Home: 1 image reports no explicit `width`/`height` — the hero uses `fill` (dimensionless
  by design; CLS is 0, so no layout-shift cost). No action required, noted for completeness.

## Schema & OpenGraph fixes needed

Extracted metadata: [`audit/meta/home.json`](audit/meta/home.json) ·
[`audit/meta/menu.json`](audit/meta/menu.json).

**JSON-LD — MISSING on both pages.** No `application/ld+json` script present anywhere.
- [ ] Add **`Restaurant`** JSON-LD (schema.org): `name`, `image`, `servesCuisine`
      (Steakhouse/Seafood), `address` (PostalAddress — Gqeberha beachfront),
      `telephone` `+27 41 584 0087`, `url` `https://www.tcr.co.za`, `priceRange`,
      `openingHoursSpecification` (**hours needed from owner**), `sameAs`
      (facebook.com/coachmanonthebay). Emit site-wide from the root layout; add a
      `Menu`/`hasMenu` reference on `/menu`.

**OpenGraph — INCOMPLETE on both pages.** Present: `og:title`, `og:description`,
`og:type`. Twitter: `twitter:card`, `twitter:title` present.
- [ ] Add **`og:image`** (+ `twitter:image`) — a 1200×630 social card (hero/terrace or
      logo on midnight). This is the most-noticed omission when the link is shared.
- [ ] Add **`og:url`** (canonical per page).
- [ ] Add **`og:site_name`** ("The Coachman").
- [ ] Add a **canonical** `<link rel="canonical">` (currently null on both pages).
- Set these via `metadata.openGraph` / `metadata.metadataBase` in the App Router so both
  pages inherit and per-page values override.

**Favicon — MISSING (the console 404).** `/favicon.ico`, `/icon.png`, `/apple-icon.png`,
`/icon.svg` all 404; this is the single console error dragging Best Practices and failing
the "no console errors" check on both pages.
- [ ] Add `app/icon.png` (and `app/apple-icon.png`) — the horse-and-carriage mark on
      midnight — so Next generates the favicon and the 404 clears.

## Consolidated fix list (by cost)

**Quick wins (unblock most gates):**
1. Add a favicon (`app/icon.png`) → clears the 404 / console-error fail on both pages.
2. Add `og:image`, `og:url`, `og:site_name`, `twitter:image`, canonical → OG gate.
3. Add `Restaurant` JSON-LD in the root layout → schema gate. *(Needs owner: opening hours.)*
4. Menu `tel:` link — persistent underline → clears `link-in-text-block`.
5. Hero Blur-Text — move `aria-label` to a heading / `aria-hidden` the letter spans →
   clears `aria-prohibited-attr`.

**Larger (home Performance 87 → ≥90):**
6. Code-split the GSAP scroll scenes and defer GSAP/Framer; trim the 198 kB first-load JS
   to pull LCP under ~2.5 s. This is the standing step-8 perf debt.

**Design judgement call (optional):**
7. Raise the Scroll-Reveal resting opacity/colour floor so the 65 transient contrast dips
   clear 3:1 even mid-animation — weigh against the strength of the reveal effect.

## Owner input needed

- **Opening hours** — required to complete the `Restaurant` JSON-LD `openingHoursSpecification`.
- **Social card art** — confirm the `og:image` (terrace hero vs. logo-on-midnight).
