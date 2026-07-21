import Image from "next/image";
import Link from "next/link";
import {
  CONTACT,
  SERVICE_CHARGE_NOTE,
  VAT_NOTE,
} from "@/data/menu";

/**
 * Homepage footer (CLAUDE.md §Page structure item 10, tail): the logo mark, the
 * Facebook link, and the standing menu notes — the 10% service charge for tables
 * of six or more and "All prices inclusive of VAT." Phone (click-to-call),
 * address and the menu link ride along so the footer also closes the loop for
 * anyone who scrolled straight to the bottom.
 *
 * Server component: no client JS. The logo is the keyed-out mark (a workaround
 * until the vector is supplied — see PROJECT_STATUS blockers).
 */
export default function Footer() {
  const { address, phone, phoneHref, facebook, website } = CONTACT;

  return (
    <footer
      data-tone="night"
      className="border-t border-silver-400/12 px-6 py-16 sm:px-10 sm:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr] md:gap-10">
          {/* Mark + tagline */}
          <div>
            <Image
              src="/images/coachman-mark.png"
              alt="The Coachman Restaurant"
              width={955}
              height={563}
              sizes="176px"
              className="h-auto w-[164px] drop-shadow-[0_1px_12px_rgba(10,18,32,0.55)]"
            />
            <p className="mt-5 max-w-[32ch] font-sans text-sm leading-relaxed text-silver-100/60">
              Fine dining on the bay — a steakhouse and seafood institution in
              Gqeberha, since 1978.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h2 className="font-sans text-xs uppercase tracking-[0.25em] text-silver-400">
              Visit
            </h2>
            <address className="mt-4 space-y-1 font-sans text-sm not-italic leading-relaxed text-silver-100/70">
              <p>{address.line1}</p>
              <p>
                {address.suburb}, {address.city}, {address.postalCode}
              </p>
            </address>
            <p className="mt-4 font-sans text-sm">
              <a
                href={phoneHref}
                className="price text-silver-100/85 transition-colors hover:text-cove"
              >
                {phone}
              </a>
            </p>
          </div>

          {/* Navigation + social */}
          <div>
            <h2 className="font-sans text-xs uppercase tracking-[0.25em] text-silver-400">
              Explore
            </h2>
            <ul className="mt-4 space-y-2 font-sans text-sm text-silver-100/70">
              <li>
                <Link
                  href="/menu"
                  className="transition-colors hover:text-cove"
                >
                  The menu
                </Link>
              </li>
              <li>
                <Link
                  href="/#visit"
                  className="transition-colors hover:text-cove"
                >
                  Visit &amp; reserve
                </Link>
              </li>
              <li>
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-cove"
                >
                  Facebook
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
              <li>
                <a
                  href={website}
                  className="transition-colors hover:text-cove"
                >
                  tcr.co.za
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Standing menu notes + small print */}
        <div className="mt-14 border-t border-silver-400/10 pt-8">
          <div className="space-y-1.5 font-sans text-xs leading-relaxed text-silver-400">
            <p>{SERVICE_CHARGE_NOTE}.</p>
            <p className="font-medium text-silver-100/70">{VAT_NOTE}</p>
          </div>
          <p className="mt-6 font-sans text-xs text-silver-400/80">
            © {new Date().getFullYear()} The Coachman Restaurant. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
