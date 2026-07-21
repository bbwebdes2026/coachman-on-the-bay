import { CONTACT } from "@/data/menu";

/**
 * Section 10 — Visit / Reserve (CLAUDE.md §Page structure item 10).
 *
 * Address and hours (both straight from CONTACT in data/menu.ts), the phone as a
 * click-to-call, a stylised map, and the amber CTA repeated. `id="visit"` is the
 * target of the hero's "Reserve a table" scroll cue.
 *
 * The map is a stylised, in-brand SVG rather than a third-party embed: a live
 * Google/Mapbox iframe would drag in cross-origin scripts and cookies that cost
 * the Performance / Best-Practices budget and leak a request on every load. The
 * SVG is decorative (aria-hidden); the real, accessible affordance is the "Get
 * directions" link, which hands off to Google Maps in a new tab.
 *
 * Reservations are by phone (the restaurant takes no online booking), so the
 * amber CTA is itself the click-to-call — the button does the thing it names.
 * Server component: no client JS.
 */

const DIRECTIONS_URL =
  "https://www.google.com/maps/search/?api=1&query=Brookes+on+the+Bay+Summerstrand+Gqeberha";

export default function VisitReserve() {
  const { address, hours, phone, phoneHref } = CONTACT;

  return (
    <section
      id="visit"
      data-tone="night"
      aria-labelledby="visit-heading"
      className="scroll-mt-8 px-6 py-24 sm:px-10 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Details */}
          <div>
            <p className="font-sans text-xs uppercase tracking-[0.3em] text-cove">
              Visit
            </p>
            <h2
              id="visit-heading"
              className="text-chrome mt-3 font-display text-3xl font-medium leading-tight sm:text-5xl"
            >
              Find us on the bay
            </h2>
            <p className="mt-4 max-w-[46ch] font-sans text-base leading-relaxed text-silver-100/70">
              On the beachfront in Summerstrand, looking out over the water.
              Book by phone — we&rsquo;ll keep the table by the window.
            </p>

            <dl className="mt-10 grid gap-8 sm:grid-cols-2">
              <div>
                <dt className="font-sans text-xs uppercase tracking-[0.25em] text-silver-400">
                  Address
                </dt>
                <dd className="mt-3 font-sans text-base leading-relaxed text-silver-100/85">
                  {address.line1}
                  <br />
                  {address.suburb}, {address.city}
                  <br />
                  {address.postalCode}
                </dd>
              </div>

              <div>
                <dt className="font-sans text-xs uppercase tracking-[0.25em] text-silver-400">
                  Hours
                </dt>
                <dd className="mt-3 space-y-2">
                  {hours.map((slot) => (
                    <div
                      key={slot.days}
                      className="flex flex-col font-sans text-base text-silver-100/85"
                    >
                      <span>{slot.days}</span>
                      <span className="price text-silver-100/70">
                        {slot.time}
                      </span>
                    </div>
                  ))}
                </dd>
              </div>
            </dl>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href={phoneHref}
                className="inline-flex items-center justify-center rounded-[3px] bg-amber px-7 py-3 font-sans text-sm font-semibold uppercase tracking-widest text-midnight transition-transform duration-200 ease-out hover:scale-[1.02]"
              >
                Reserve a table
              </a>
              <a
                href={phoneHref}
                className="font-sans text-base text-silver-100/85 transition-colors hover:text-cove"
              >
                Call{" "}
                <span className="price font-medium text-silver-100">
                  {phone}
                </span>
              </a>
            </div>
          </div>

          {/* Stylised map */}
          <figure className="relative">
            <div className="relative overflow-hidden rounded-lg border border-silver-400/12 bg-navy-800">
              <svg
                viewBox="0 0 400 300"
                role="img"
                aria-hidden
                className="h-auto w-full"
              >
                {/* Land */}
                <rect width="400" height="300" fill="#101B2E" />

                {/* The bay — a cove-tinted wash below the coastline */}
                <path
                  d="M400,96 C320,132 262,178 236,300 L400,300 Z"
                  fill="#2E8BFF"
                  fillOpacity="0.12"
                />
                <path
                  d="M400,96 C320,132 262,178 236,300"
                  fill="none"
                  stroke="#2E8BFF"
                  strokeOpacity="0.55"
                  strokeWidth="1.5"
                />

                {/* Streets — a light, abstract grid on the land side */}
                <g stroke="#9AA3AE" strokeOpacity="0.16" strokeWidth="1">
                  <path d="M0,70 L300,70" />
                  <path d="M0,140 L250,140" />
                  <path d="M0,210 L205,210" />
                  <path d="M80,0 L80,300" />
                  <path d="M170,0 L170,300" />
                  <path d="M260,0 L235,300" />
                </g>

                {/* Location pin — cove dot in an amber halo, on the shore road */}
                <g transform="translate(170,140)">
                  <circle r="26" fill="#D9954A" fillOpacity="0.14" />
                  <circle r="15" fill="#D9954A" fillOpacity="0.22" />
                  <circle r="6.5" fill="#2E8BFF" />
                  <circle r="6.5" fill="none" stroke="#E6EAEF" strokeWidth="1.5" />
                </g>
              </svg>

              {/* Labels + directions — real text over the decorative SVG */}
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-5 sm:p-6">
                <span className="pointer-events-auto self-start font-sans text-xs uppercase tracking-[0.25em] text-silver-400">
                  Summerstrand · The Bay
                </span>
                <a
                  href={DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-events-auto inline-flex items-center gap-1.5 self-start font-sans text-sm font-medium text-cove underline decoration-cove/50 underline-offset-2 transition-colors hover:decoration-cove"
                >
                  Get directions
                  <span aria-hidden>→</span>
                  <span className="sr-only">
                    to The Coachman on Google Maps (opens in a new tab)
                  </span>
                </a>
              </div>
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
