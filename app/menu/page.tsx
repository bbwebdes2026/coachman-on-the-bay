import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import MenuCategoryBlock from "@/components/MenuList";
import JsonLd from "@/components/JsonLd";
import { menuJsonLd } from "@/data/restaurant";
import {
  CONTACT,
  HOUSE_EPIGRAPH,
  LIQUOR_NOTE,
  luxuryCollection,
  menu,
  SERVICE_CHARGE_NOTE,
  VAT_NOTE,
  type MenuCategory,
  type MenuSection,
} from "@/data/menu";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "The full Coachman menu — starters, seafood, the charcoal grill, South African traditional dishes, burgers, desserts, the wine cellar and the bar. All prices in Rand, inclusive of VAT.",
};

/**
 * /menu — the full transcribed menu (CLAUDE.md §Menu page). Every category in
 * printed order, each anchored so the homepage Flowing Menu rows land on it.
 * Entirely server-rendered from /data/menu.ts.
 */

// The wine cellar prints its premium reds — the Luxury Collection — between the
// red blends and the ports. luxuryCollection is stored on its own (it is also a
// homepage section), so splice it in just before Port & Sherry for /menu.
function wineCellarSections(category: MenuCategory): MenuSection[] {
  const sections = [...category.sections];
  const portIndex = sections.findIndex((s) => s.id === "port-sherry");
  sections.splice(portIndex < 0 ? sections.length : portIndex, 0, luxuryCollection);
  return sections;
}

export default function MenuPage() {
  return (
    <main className="min-h-screen bg-midnight text-silver-100">
      {/* Menu structured data (the Restaurant node comes from the root layout). */}
      <JsonLd data={menuJsonLd} />

      <header className="px-6 pb-8 pt-12 sm:px-10 sm:pt-16">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-sans text-sm text-silver-400 transition-colors hover:text-cove"
          >
            <span aria-hidden>←</span> The Coachman
          </Link>

          <div className="mt-8 flex items-end gap-5">
            <Image
              src="/images/coachman-mark.png"
              alt="The Coachman horse-and-carriage mark"
              width={955}
              height={563}
              className="h-14 w-auto sm:h-16"
              priority
            />
            <h1 className="text-chrome font-display text-5xl font-medium leading-none sm:text-6xl">
              Menu
            </h1>
          </div>

          <p className="mt-5 max-w-[54ch] font-sans text-base leading-relaxed text-silver-100/70">
            Fine dining on the bay in Gqeberha — a steakhouse and seafood
            institution. Prices are in South African Rand.
          </p>
        </div>
      </header>

      {/* Sticky category jump-nav. Anchors match the Flowing Menu rows. */}
      <nav
        aria-label="Menu categories"
        className="sticky top-0 z-30 border-y border-silver-400/10 bg-midnight/85 backdrop-blur"
      >
        <ul className="mx-auto flex max-w-4xl gap-x-6 overflow-x-auto px-6 py-3 sm:px-10">
          {menu.map((category) => (
            <li key={category.id}>
              <a
                href={`#${category.id}`}
                className="whitespace-nowrap font-sans text-sm text-silver-400 transition-colors hover:text-cove"
              >
                {category.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mx-auto max-w-4xl px-6 sm:px-10">
        {menu.map((category) => (
          <MenuCategoryBlock
            key={category.id}
            category={category}
            sections={category.id === "wine-cellar" ? wineCellarSections(category) : undefined}
          />
        ))}
      </div>

      <footer className="mt-8 border-t border-silver-400/15 px-6 py-16 sm:px-10">
        <div className="mx-auto max-w-4xl space-y-3 font-sans text-sm text-silver-400">
          <p>{SERVICE_CHARGE_NOTE}</p>
          <p className="font-medium text-silver-100/80">{VAT_NOTE}</p>
          <p>{LIQUOR_NOTE}</p>
          <p className="max-w-[62ch] pt-4 italic">{HOUSE_EPIGRAPH}</p>
          <p className="pt-4">
            To reserve a table, call{" "}
            <a
              href={CONTACT.phoneHref}
              className="text-cove underline decoration-cove/50 underline-offset-2 transition-colors hover:decoration-cove"
            >
              {CONTACT.phone}
            </a>
            .
          </p>
        </div>
      </footer>
    </main>
  );
}
