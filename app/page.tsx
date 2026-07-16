const tokens = [
  { name: "midnight", hex: "#0A1220", className: "bg-midnight border border-white/10" },
  { name: "navy-800", hex: "#101B2E", className: "bg-navy-800" },
  { name: "cove", hex: "#2E8BFF", className: "bg-cove" },
  { name: "amber", hex: "#D9954A", className: "bg-amber" },
  { name: "teal", hex: "#0F7C7A", className: "bg-teal" },
  { name: "silver-100", hex: "#E6EAEF", className: "bg-silver-100" },
  { name: "silver-400", hex: "#9AA3AE", className: "bg-silver-400" },
  { name: "coast-50", hex: "#F4F7F9", className: "bg-coast-50" },
  { name: "coast-300", hex: "#A8CDE0", className: "bg-coast-300" },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-24">
      <p className="font-sans text-sm uppercase tracking-[0.35em] text-silver-400">
        Gqeberha · On the bay
      </p>

      <h1 className="mt-4 font-display text-4xl font-semibold leading-none text-silver-100">
        The Coachman
      </h1>

      <p className="mt-6 max-w-xl font-sans text-lg text-silver-400">
        Fine dining on the bay. Scaffold in place — design tokens and both
        Google Fonts (Cormorant Garamond &amp; Hanken Grotesk) are wired and
        rendering, with Lenis smooth scroll and a{" "}
        <code className="text-cove">prefers-reduced-motion</code> guard active.
      </p>

      {/* Font proof */}
      <div className="mt-14 grid gap-8 sm:grid-cols-2">
        <div className="rounded-lg bg-navy-800 p-6">
          <span className="text-xs uppercase tracking-widest text-silver-400">
            Display · Cormorant Garamond
          </span>
          <p className="mt-3 font-display text-2xl italic text-silver-100">
            Springbok, oxtail &amp; the bay
          </p>
          <p className="mt-1 font-display text-3xl tabular-nums text-amber">
            R285
          </p>
        </div>
        <div className="rounded-lg bg-navy-800 p-6">
          <span className="text-xs uppercase tracking-widest text-silver-400">
            Body · Hanken Grotesk
          </span>
          <p className="mt-3 font-sans text-base text-silver-100">
            Charcoal-grilled steaks and line-caught seafood, served beneath
            electric-blue LED coves and warm amber starlight.
          </p>
        </div>
      </div>

      {/* Token proof */}
      <div className="mt-14">
        <span className="text-xs uppercase tracking-widest text-silver-400">
          Design tokens
        </span>
        <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {tokens.map((t) => (
            <li key={t.name} className="flex flex-col gap-2">
              <span
                className={`h-14 w-full rounded-md ${t.className}`}
                aria-hidden
              />
              <span className="font-sans text-xs text-silver-100">
                {t.name}
              </span>
              <span className="font-sans text-xs text-silver-400">{t.hex}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA proof — amber is the only CTA colour */}
      <div className="mt-14">
        <a
          href="#"
          className="inline-flex items-center rounded-full bg-amber px-7 py-3 font-sans text-sm font-semibold uppercase tracking-widest text-midnight transition-transform duration-200 ease-out hover:scale-[1.02]"
        >
          Reserve a table
        </a>
      </div>
    </main>
  );
}
