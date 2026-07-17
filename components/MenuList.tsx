import {
  formatPrice,
  type MenuCategory,
  type MenuItem,
  type MenuSection,
  type Price,
} from "@/data/menu";

/**
 * Presentational renderers for the transcribed menu (/data/menu.ts), shared by
 * the /menu page. Server components — the menu is static data, so nothing here
 * ships JS.
 *
 * The type pattern follows the printed menu (CLAUDE.md §Typography): serif dish
 * name on the left, right-aligned price in tabular figures, sans description
 * below. Multi-column items (200g/300g, Glass/Bottle, fillet upgrades) keep
 * their labels rather than being flattened.
 */

function PriceValue({ price }: { price: Price }) {
  return (
    <span className="price font-display text-lg font-medium text-silver-100 sm:text-xl">
      {formatPrice(price)}
    </span>
  );
}

function Prices({ item }: { item: MenuItem }) {
  if (item.price !== undefined) return <PriceValue price={item.price} />;
  if (!item.prices) return null;
  return (
    <div className="flex flex-wrap items-baseline justify-end gap-x-5 gap-y-1">
      {item.prices.map((pp) => (
        <span key={pp.label} className="whitespace-nowrap">
          <span className="mr-2 font-sans text-xs uppercase tracking-wide text-silver-400">
            {pp.label}
          </span>
          <PriceValue price={pp.price} />
        </span>
      ))}
    </div>
  );
}

function MenuRow({ item }: { item: MenuItem }) {
  return (
    <li className="border-b border-silver-400/10 py-4">
      <div className="flex items-baseline justify-between gap-6">
        <h4 className="font-display text-xl font-medium leading-tight sm:text-2xl">
          {item.name}
        </h4>
        <div className="shrink-0">
          <Prices item={item} />
        </div>
      </div>

      {item.description && (
        <p className="mt-1.5 max-w-[68ch] font-sans text-sm leading-relaxed text-silver-100/70 sm:text-base">
          {item.description}
        </p>
      )}

      {item.tastingNote && (
        <p className="mt-1.5 max-w-[68ch] font-sans text-sm italic leading-relaxed text-silver-100/55">
          {item.tastingNote}
        </p>
      )}

      {item.pairing && (
        <p className="mt-2 max-w-[68ch] font-sans text-sm leading-relaxed text-silver-100/70">
          <span className="text-cove">Best served with {item.pairing.wine}</span>
          {" — "}
          {item.pairing.note}
        </p>
      )}
    </li>
  );
}

function MenuSectionBlock({
  section,
  showTitle,
}: {
  section: MenuSection;
  showTitle: boolean;
}) {
  return (
    <div className="mt-10 first:mt-0">
      {showTitle && (
        <h3 className="font-sans text-sm font-semibold uppercase tracking-[0.2em] text-cove/90">
          {section.title}
        </h3>
      )}
      {section.note && (
        <p className="mt-1 font-sans text-sm italic text-silver-400">{section.note}</p>
      )}
      <ul className="mt-4">
        {section.items.map((item, i) => (
          <MenuRow key={`${item.name}-${i}`} item={item} />
        ))}
      </ul>
    </div>
  );
}

export default function MenuCategoryBlock({
  category,
  sections,
}: {
  category: MenuCategory;
  /** Override the category's own sections (used to inject the Luxury Collection into the wine cellar). */
  sections?: MenuSection[];
}) {
  const list = sections ?? category.sections;
  // Hide the section subtitle only when it would just repeat the category name.
  const single = list.length === 1 && list[0].title === category.title;

  return (
    <section id={category.id} className="scroll-mt-24 border-t border-silver-400/15 py-14">
      <header>
        <h2 className="text-chrome font-display text-3xl font-medium sm:text-4xl">
          {category.title}
        </h2>
        {category.note && (
          <p className="mt-2 max-w-[60ch] font-sans text-sm italic text-silver-400">
            {category.note}
          </p>
        )}
      </header>

      <div className="mt-8">
        {list.map((section) => (
          <MenuSectionBlock key={section.id} section={section} showTitle={!single} />
        ))}
      </div>
    </section>
  );
}
