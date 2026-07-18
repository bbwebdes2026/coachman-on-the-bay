/**
 * The Coachman — menu data.
 *
 * Transcribed from the printed menu photographed in /assets-raw (coachman-*.jpg),
 * which is the source of truth. Those screenshots are menu DATA, not photography:
 * they are never rendered in the UI and never pass through the image pipeline.
 * All menu UI is built from this file.
 *
 * Wording, spelling and punctuation follow the printed menu deliberately —
 * including its own inconsistencies ("Specialties" vs "Speciality", "Kota Flambe"
 * without the accent, "intergrated" in two tasting notes). Do not "correct" them
 * without the client's say-so; they are what the restaurant prints.
 */

/** "S.Q." on the printed menu — subject to quotation. */
export const SQ = "S.Q." as const;

export type Price = number | typeof SQ;

/** A labelled price, for items printed with more than one column. */
export interface PricePoint {
  /** "200g", "300g", "Glass", "Bottle", "Choice of fillet", … */
  label: string;
  price: Price;
}

/** The printed "Best served with …" note on the SA Traditional dishes. */
export interface WinePairing {
  wine: string;
  note: string;
}

export interface MenuItem {
  name: string;
  description?: string;
  /** Single price. Mutually exclusive with `prices`. */
  price?: Price;
  /** Labelled prices (weight options, glass/bottle, fillet upgrade). */
  prices?: PricePoint[];
  /** Tasting note — wine list and Luxury Collection. */
  tastingNote?: string;
  /** SA Traditional dishes only. */
  pairing?: WinePairing;
}

export interface MenuSection {
  id: string;
  title: string;
  /** Printed note that belongs to this section. */
  note?: string;
  /** Column headers where the section prints more than one price column. */
  priceColumns?: string[];
  items: MenuItem[];
}

export interface MenuCategory {
  /** Anchor on /menu; the Flowing Menu rows link to these. */
  id: string;
  title: string;
  /** True for the six Flowing Menu navigator rows (CLAUDE.md §Page structure). */
  inNavigator: boolean;
  note?: string;
  sections: MenuSection[];
}

// ---------------------------------------------------------------------------
// Standing menu notes
// ---------------------------------------------------------------------------

/** Printed at the foot of the menu. Required on /menu and in the footer. */
export const VAT_NOTE = "All prices inclusive of VAT.";

/** Printed across the foot of the starters page. */
export const SERVICE_CHARGE_NOTE =
  "Please note that a service charge of 10% is added to tables of six or more";

/** Printed on the specialties and burgers pages. */
export const SERVICE_QUALITY_NOTE =
  "Please report any instance of bad service or food so the matter can be rectified at once";

/** Printed on the drinks pages. */
export const LIQUOR_NOTE =
  "Alcohol not to be sold to persons under the age of 18 years.";

/** Printed under the main courses. */
export const MAIN_MEALS_NOTE =
  "Main meals are served with vegetables of the day and a choice of chips, rice or baked potato.";

/** Set in italics at the foot of the starters page. */
export const HOUSE_EPIGRAPH =
  "There is hardly anything in this world that someone cannot make a little worse and sell a little cheaper. The people who consider price only, are this man's lawful prey.";

export const CONTACT = {
  phone: "041 584 0087",
  /** E.164, for the click-to-call href. */
  phoneHref: "tel:+27415840087",
  website: "https://www.tcr.co.za",
  facebook: "https://www.facebook.com/coachmanonthebay",
  /** Owner-confirmed 2026-07-18. Human-readable; the schema.org form is in data/restaurant.ts. */
  address: {
    line1: "Brookes on the Bay",
    suburb: "Summerstrand",
    city: "Gqeberha",
    postalCode: "6001",
    /** One-line form for the Visit/Reserve footer (built in step 7). */
    oneLine: "Brookes on the Bay, Summerstrand, Gqeberha, 6001",
  },
  /** Trading hours, owner-confirmed 2026-07-18. For the Visit/Reserve footer. */
  hours: [
    { days: "Monday – Saturday", time: "11:30 – 22:00" },
    { days: "Sunday", time: "11:30 – 21:00" },
  ],
} as const;

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

/**
 * Format a price the way the printed menu does: "R285", "R1 345", "R6 500" —
 * a space as the thousands separator, never a comma. Render inside `.price`
 * (see globals.css) so Cormorant's old-style figures don't leak into prices.
 *
 * The separator is a non-breaking space so a price never wraps across lines.
 * Deliberately hand-rolled rather than toLocaleString("en-ZA"): locale output
 * depends on the runtime's ICU build, so server and client can disagree and
 * trip a hydration mismatch on every price.
 */
const THOUSANDS_SEPARATOR = " ";

export function formatPrice(price: Price): string {
  if (price === SQ) return SQ;
  return `R${String(price).replace(/\B(?=(\d{3})+(?!\d))/g, THOUSANDS_SEPARATOR)}`;
}

// ---------------------------------------------------------------------------
// Food
// ---------------------------------------------------------------------------

const starters: MenuCategory = {
  id: "starters",
  title: "Starters",
  inNavigator: true,
  sections: [
    {
      id: "starters-list",
      title: "Starters",
      items: [
        {
          name: "Prawn Cocktail",
          price: 105,
          description: "Baby prawns covered in our tangy seafood sauce.",
        },
        {
          name: "Prawn Scampi",
          price: 115,
          description:
            "Queen prawns crumbed, seasoned and deep-fried, served on a bed of rice.",
        },
        {
          name: "Baby Garides",
          price: 115,
          description:
            "Queen prawns dipped in our a la Greek basting, pan fried and served on a bed of rice.",
        },
        {
          name: "Avocado Ritz",
          price: 118,
          description: "Avo topped with baby prawns covered in a seafood sauce.",
        },
        {
          name: "Smoked Salmon",
          price: 129,
          description:
            "Lightly smoked salmon rolls, served with cream cheese, capers and chives.",
        },
        {
          name: "Jalapeño Poppers",
          price: 89,
          description:
            "Jalapeños stuffed with cream cheese, crumbed and fried to a golden crisp.",
        },
        {
          name: "Natalie's Delight",
          price: 109,
          description:
            "Imported baby calamari tubes and heads grilled in our seafood basting.",
        },
        {
          name: "Calamari",
          price: 99,
          description: "Tender calamari strips fried to a golden crisp.",
        },
        {
          name: "Salmon Oysters",
          price: 250,
          description: "6 Oysters dressed with Norwegian salmon and caviar.",
        },
        {
          name: "Mussels",
          price: 105,
          description:
            "Served in a delicate creamy garlic and lemon sauce, topped with cheese and baked.",
        },
        {
          name: "Crumbed Mushrooms",
          price: 80,
          description:
            "Mushrooms covered with breadcrumbs and deep fried to golden brown.",
        },
        {
          name: "Black Widow",
          price: 110,
          description:
            "Black mushroom covered with a creamy garlic sauce, topped with cheese and baked.",
        },
        {
          name: "Chicken Liver Peri-Peri",
          price: 95,
          description:
            "Chicken livers braised in our delectable, tangy peri-peri sauce.",
        },
        {
          name: "Chicken Wings",
          price: 79,
          description:
            "Chicken wings basted and grilled in our delicious barbeque sauce.",
        },
        {
          name: "Snails (Escargot)",
          description:
            "6 Snails out of the shells, delicately flavoured in garlic butter.",
          prices: [
            { label: "Garlic butter", price: 95 },
            { label: "Or served with Roquefort sauce", price: 105 },
          ],
        },
        {
          name: "Halloumi Cheese",
          price: 85,
          description: "Deep fried or grilled, served with cranberry sauce.",
        },
        {
          name: "Crayfish Tail",
          price: SQ,
          description:
            "Grilled and served with a sauce of your choice, lemon butter, garlic or peri-peri. (Subject to availability)",
        },
        {
          name: "Deep Fried Camembert",
          price: 79,
          description:
            "Deep fried camembert cheese served with cranberry sauce and a pita.",
        },
        {
          name: "Carpaccio",
          price: 115,
          description:
            "Springbok, dressed with olive oil and balsamic vinegar, served with slivers of parmesan cheese.",
        },
        {
          name: "Scallops",
          price: SQ,
          description:
            "Grilled in white wine, garlic, black pepper and butter. Served with coriander and brown bread.",
        },
        { name: "Oysters", price: SQ },
      ],
    },
    {
      id: "platters",
      title: "Platters",
      items: [
        {
          name: "Meze Platter for 2",
          price: 390,
          description:
            "Calamari, halloumi, crumbed mushrooms and 3 queen prawns on a bed of rice, surrounded by Greek salad.",
        },
        {
          name: "Combination Platter",
          price: SQ,
          description: "Make your own selection of any of the above starters.",
        },
      ],
    },
    {
      id: "soup",
      title: "Soup",
      items: [
        { name: "Butternut", price: 85 },
        { name: "Beef Goulash", price: 115 },
        { name: "Mexican", price: 115 },
        {
          name: "Mussel Soup",
          price: 110,
          description:
            "½ shell New Zealand mussels cooked in a creamy garlic and wine soup.",
        },
      ],
    },
    {
      id: "breads",
      title: "Breads",
      items: [
        { name: "Pita", price: 19 },
        {
          name: "Focaccia",
          prices: [
            { label: "Garlic, olive oil and origanum", price: 65 },
            { label: "Topped with feta", price: 89 },
          ],
        },
      ],
    },
    {
      id: "from-the-garden",
      title: "From the Garden",
      items: [
        { name: "Greek Salad", price: 99 },
        { name: "French Salad", price: 79 },
        { name: "Cajun Chicken Salad", price: 115 },
        { name: "Roquefort Salad", price: 115 },
        { name: "Calamari Salad", price: 115 },
      ],
    },
    {
      id: "extras",
      title: "Extras",
      items: [
        { name: "Onion Rings (Fried)", price: 45 },
        { name: "Chips or Baked Potato", price: 45 },
        { name: "Sweet Potato Chips", price: 49 },
        { name: "Extra vegetables", price: 45 },
      ],
    },
  ],
};

const seafood: MenuCategory = {
  id: "seafood",
  title: "Seafood",
  inNavigator: true,
  sections: [
    {
      id: "seafood-list",
      title: "Seafood",
      items: [
        {
          name: "Calamari",
          price: 185,
          description: "Fresh, tender calamari strips fried to a golden crisp.",
        },
        {
          name: "Natalie's Delight",
          price: 195,
          description:
            "Imported baby calamari tubes and heads grilled in a garlic and lemon seafood sauce.",
        },
        {
          name: "South Sea Favorite",
          price: 245,
          description:
            "Filleted kingklip brushed in our special seafood basting and lightly grilled.",
        },
        {
          name: "Sole",
          price: SQ,
          description: "Sole grilled in lemon butter sauce.",
        },
        {
          name: "Sole Coachman",
          price: SQ,
          description:
            "Large sole grilled and topped with our own delicious Coachman sauce.",
        },
        {
          name: "Sole Hawaii",
          price: SQ,
          description: "Grilled sole covered with prawn and creamy cheese sauce.",
        },
        {
          name: "Prawn Special",
          price: 285,
          description: "6 King prawns, grilled in our seafood basting.",
        },
        {
          name: "Garides (Tiger prawns)",
          price: SQ,
          description:
            "Prawns grilled in the sauce of your choice lemon butter, garlic, peri-peri or a la Greek. Check selection of sizes with waitron.",
        },
        {
          name: "Crayfish",
          price: SQ,
          description:
            "Grilled and served with a sauce of your choice of lemon butter, garlic or peri-peri. (Subject to availability)",
        },
        {
          name: "Crayfish Thermidor",
          price: SQ,
          description:
            "Grilled crayfish, covered with our chef's favorite Thermidor sauce.",
        },
        {
          name: "Seafood Platter for 2",
          price: 1345,
          description:
            "A selection of two freshly cooked crayfish tails, four queen tiger prawns, four mussels, line fish, calamari and served with a fresh garden salad, lemon butter, and a Greek seafood sauce.",
        },
        { name: "Seafood Platter for 1", price: 685 },
      ],
    },
    {
      id: "sauces",
      title: "Sauces",
      items: [
        { name: "Roquefort Sauce, Cheese Sauce", price: 45 },
        { name: "Mustard Sauce, Pepper Sauce", price: 45 },
        { name: "The Dawn Sauce (Garlic)", price: 45 },
        { name: "George's Sauce (Mushroom)", price: 45 },
        { name: "Peri-Peri Sauce", price: 40 },
        { name: "Waki (Monkey Gland)", price: 45 },
        { name: "Sensation Sauce (Cheese and Monkey Gland)", price: 45 },
        { name: "Lemon Butter, Garlic Butter", price: 40 },
        { name: "Coachman Sauce", price: 45 },
        { name: "Hawaii Sauce, Raging Roger Sauce", price: 59 },
        { name: "Camembert and Berry Sauce", price: 59 },
        { name: "Biltong Sauce", price: 75 },
      ],
    },
  ],
};

const charcoalGrill: MenuCategory = {
  id: "charcoal-grill",
  title: "Charcoal Grill",
  inNavigator: true,
  note: MAIN_MEALS_NOTE,
  sections: [
    {
      id: "charcoal-grill-list",
      title: "Charcoal Grill",
      priceColumns: ["200g", "300g"],
      items: [
        {
          name: "Fillet",
          description: "Considered to be the King of Beef. Chargrilled to perfection.",
          prices: [
            { label: "200g", price: 205 },
            { label: "300g", price: 270 },
          ],
        },
        {
          name: "Rump",
          description: "Matured to a tender succulence.",
          prices: [
            { label: "200g", price: 165 },
            { label: "300g", price: 195 },
          ],
        },
        {
          name: "Sirloin",
          prices: [
            { label: "200g", price: 165 },
            { label: "300g", price: 195 },
          ],
        },
        {
          name: "T-Bone",
          price: 285,
          description:
            "A combination of fillet and sirloin on the bone, basted in our tangy barbeque sauce.",
        },
        {
          name: "Lamb Loin Chops",
          price: 245,
          description: "A special cut of lamb chops with our special basting.",
        },
        {
          name: "Pork Chops",
          price: 170,
          description: "Pork chops basted and grilled.",
        },
        {
          name: "Fifty-Fifty",
          price: 295,
          description:
            "A combo of two lamb chops and spare ribs. Well-marinated and grilled to perfection.",
        },
        {
          name: "Beef Kebabs",
          price: 270,
          description: "Tender cubed steak, dipped in our special basting.",
        },
        {
          name: "Spare Ribs",
          price: 290,
          description:
            "Marinated pork ribs, basted with our special basting and grilled to perfection.",
        },
        {
          name: "Prime Cut (For the big eater)",
          price: 399,
          description:
            "For the big appetite! 1 kg young beef marinated in our tangy barbeque sauce and served on the bone.",
        },
      ],
    },
    {
      id: "coachman-specialties",
      title: "Coachman Specialties",
      items: [
        {
          name: "Steak Rossini",
          description: "Sirloin topped with chicken livers peri-peri.",
          prices: [
            { label: "Sirloin", price: 260 },
            { label: "Choice of fillet", price: 295 },
          ],
        },
        {
          name: "Coachman Special",
          price: 250,
          description:
            "Fillet grilled to perfection, covered in a layer of mushrooms and topped with a cheese sauce.",
        },
        {
          name: "Coachman Surf 'n Turf",
          description:
            "The best of both worlds - choice sirloin topped with prawns or calamari and a cheese sauce.",
          prices: [
            { label: "Sirloin", price: 260 },
            { label: "Choice of fillet", price: 295 },
          ],
        },
        {
          name: "The Dawn",
          description:
            "Matured, tender rump grilled to perfection in a creamy garlic sauce.",
          prices: [
            { label: "Rump", price: 215 },
            { label: "Choice of fillet", price: 250 },
          ],
        },
        {
          name: "Filetto",
          price: 290,
          description:
            "Medallions of fillet pan fried in a lemon butter garlic sauce and sauteed in brandy. Served with pasta and feta cheese.",
        },
        {
          name: "Waki",
          description: "Matured rump, flavoured with a spicy, tangy Monkey Gland sauce.",
          prices: [
            { label: "Rump", price: 215 },
            { label: "Choice of fillet", price: 250 },
          ],
        },
        {
          name: "Lamb Shank",
          price: 279,
          description:
            "Lamb shank stuffed with garlic and seasoned with herbs. Served with mash, tzatsiki and vegetables.",
        },
        {
          name: "George's Special",
          price: 250,
          description: "Grilled fillet with mushrooms, cream, French mustard and liqueur.",
        },
        {
          name: "Pepper Steak",
          price: 250,
          description:
            "Fillet covered in a creamy wine sauce, laced with freshly ground black and green peppercorns.",
        },
        {
          name: "Old Man Steak",
          description: "Sirloin covered with a creamy mustard sauce.",
          prices: [
            { label: "Sirloin", price: 215 },
            { label: "Choice of fillet", price: 250 },
          ],
        },
        {
          name: "Roquefort Steak",
          description:
            "Matured rump covered with a delicious, creamy blue cheese sauce.",
          prices: [
            { label: "Rump", price: 215 },
            { label: "Choice of fillet", price: 250 },
          ],
        },
        {
          name: "Raging Roger",
          description: "Sirloin covered with jalapeño chillies and black mushrooms.",
          prices: [
            { label: "Sirloin", price: 220 },
            { label: "Choice of fillet", price: 255 },
          ],
        },
      ],
    },
    {
      id: "poultry",
      title: "Poultry",
      items: [
        {
          name: "Chicken Kebab",
          price: 175,
          description: "Chicken cubes, peppers and onion.",
        },
        {
          name: "Kota Flambe",
          price: 175,
          description: "Chicken fillets pan-fried in our lemon butter and paprika sauce.",
        },
        {
          name: "Crispy Christy (Schnitzel)",
          price: 175,
          description: "Chicken fillets seasoned and deep fried to a golden crisp.",
        },
      ],
    },
    {
      id: "pasta",
      title: "Pasta",
      items: [
        {
          name: "Seafood Pasta",
          price: 225,
          description: "Calamari, mussels and baby prawns in our seafood sauce.",
        },
        {
          name: "Chicken Pasta",
          price: 155,
          description: "Chicken sauteed with mushrooms and cherry tomatoes.",
        },
      ],
    },
    {
      id: "vegetarian",
      title: "Vegetarian",
      items: [
        {
          name: "Vegetarian Platter",
          price: 155,
          description:
            "A combination of baked potato, crumbed mushrooms, vegetables, halloumi cheese, asparagus and rice.",
        },
        {
          name: "Vegetarian Pasta",
          price: 155,
          description:
            "Pasta served with spinach, feta, olives and pumpkin seeds or stir fry vegetables.",
        },
      ],
    },
    {
      id: "traveling-lites",
      title: "Traveling Lites",
      items: [
        {
          name: "Prawn Fiesta",
          price: 265,
          description: "10 Queen prawns prepared in our seafood basting.",
        },
        {
          name: "Chicken Schnitzel",
          price: 135,
          description: "Chicken fillet seasoned and fried to a golden crisp.",
        },
        {
          name: "Chicken Kebab",
          price: 135,
          description: "Chicken kebab basted and grilled to perfection.",
        },
        {
          name: "Chicken Shawarma",
          price: 125,
          description:
            "Pita filled with chicken cubes, salad and tsatziki, served with chips.",
        },
        {
          name: "Beef Shawarma",
          price: 155,
          description:
            "Pita filled with cubed fillet, salad and tsatziki, served with chips.",
        },
        {
          name: "Souvlakia (Beef Kebab)",
          price: 205,
          description: "Tender cubed steak, dipped in our special basting.",
        },
        {
          name: "Mini Chops",
          price: 170,
          description: "Lamb loin chops prepared with our special basting.",
        },
        {
          name: "Steak & Egg",
          price: 175,
          description: "Charcoal grilled sirloin steak, served with 2 eggs and chips.",
        },
        {
          name: "Mini Ribs 300g",
          price: 185,
          description: "Marinated pork ribs, basted with our special basting.",
        },
      ],
    },
  ],
};

const southAfricanTraditional: MenuCategory = {
  id: "south-african-traditional",
  title: "South African Traditional",
  inNavigator: true,
  sections: [
    {
      id: "sa-traditional-list",
      title: "South African Traditional Dishes",
      items: [
        {
          name: "Springbok",
          price: 260,
          description:
            "Springbok medallions served with sadza topped with spinach and flaked almond.",
          pairing: {
            wine: "Diemersdal Private Collection Red",
            note: "A Bordeaux-styled blend with dark chocolate, enticing cedar, wafting blackberry jam, cherry, cassis and vanilla notes.",
          },
        },
        {
          name: "Ostrich",
          price: 260,
          description:
            "Ostrich medallions basted in lemon butter. Topped with onion rings. Served with sadza topped with spinach and flaked almond.",
          pairing: {
            wine: "La Motte Syrah",
            note: "Shiraz grapes of a number of cool terroirs captures juicy berry-fruit, sweet liquorice, violet flowers and pepper spice.",
          },
        },
        {
          name: "Oxtail",
          price: 280,
          description:
            "Traditional South African oxtail curry. Served with rice and papadums.",
          pairing: {
            wine: "Anthonij Rupert Optima",
            note: "The silky, plush textured palate is full of ripe plums, hedgerow fruit, cocoa, spice and cigarbox flavours that makes for an enveloping mouthful. Complex and elegant, the oak harmonizes with the fruit, ending with a lingering intergrated finish.",
          },
        },
        {
          name: "Eisbein",
          price: 260,
          description:
            "Smoked pork hock, slowly cooked and basted in our signature sauce. Served with mash.",
          pairing: {
            wine: "Mulderbosch Steen op Hout Chenin Blanc",
            note: "Lightly wooded. A powerful nose of guava, lime zest, ripe pear, honeysuckle and orange blossoms. A juicy palate with opulent passion fruit and a tart grapefruit finish.",
          },
        },
      ],
    },
  ],
};

const burgers: MenuCategory = {
  id: "burgers",
  title: "Coachman's Burgers",
  inNavigator: true,
  note: "The above served with chips and onion rings.",
  sections: [
    {
      id: "burgers-list",
      title: "Coachman's Burgers",
      note: "Choice of Beef, Chicken, Calamari or Veg.",
      items: [
        {
          name: "Plain",
          price: 110,
          description:
            "Grilled to perfection, covered with our special sauce, topped with a slice of tomato, lettuce, gherkins and onions.",
        },
        {
          name: "Gourmet Cheese",
          price: 130,
          description:
            "Grilled to perfection, topped with a slice of cheese, tomato, lettuce and onions.",
        },
        {
          name: "Coachman",
          price: 135,
          description: "Covered in a layer of mushrooms and topped with a cheese sauce.",
        },
        {
          name: "George's",
          price: 135,
          description: "Mushrooms, cream, Dijon mustard and liqueur sauce.",
        },
        { name: "The Dawn", price: 135, description: "Creamy garlic sauce." },
        {
          name: "Roquefort",
          price: 149,
          description:
            "Covered with bacon, a delicious creamy blue cheese sauce and topped with green figs.",
        },
        {
          name: "Old Man",
          price: 135,
          description: "Topped with a creamy mustard sauce.",
        },
        {
          name: "Pepper",
          price: 135,
          description:
            "In a creamy brandy sauce, laced with a freshly ground black pepper and Madagascar green peppercorns.",
        },
        {
          name: "Waki",
          price: 135,
          description:
            "Grilled to perfection deliciously flavoured with a spicy, tangy Monkey Gland sauce.",
        },
        {
          name: "Hawaiian",
          price: 135,
          description: "The chef's recipe topped with pineapple.",
        },
        {
          name: "Greek",
          price: 140,
          description: "Topped with grilled halloumi cheese and caramelized onions.",
        },
      ],
    },
    {
      id: "burger-extras",
      title: "Extras",
      items: [
        { name: "Egg. Caramelized onion.", price: 18 },
        { name: "Bacon. Cheese. Pineapple. Blue cheese.", price: 25 },
        {
          name: "Green fig. Pepper sauce. Waki Sauce. Mushroom sauce. Cheese sauce. Halloumi.",
          price: 35,
        },
      ],
    },
  ],
};

const desserts: MenuCategory = {
  id: "desserts",
  title: "Desserts",
  inNavigator: false,
  sections: [
    {
      id: "desserts-list",
      title: "Desserts",
      items: [
        { name: "Selection of delicious homemade cakes from our display", price: 69 },
        {
          name: "Yoghurt",
          price: 59,
          description: "Full cream yoghurt sprinkled with nuts and honey.",
        },
        {
          name: "Baklava",
          price: 65,
          description:
            "Pecan nuts and almonds between layers of phyllo in thick syrup served with cream or ice-cream.",
        },
        {
          name: "Strawberries & Liqueur",
          price: 69,
          description: "Served with cream or ice-cream (when available).",
        },
        {
          name: "Cherry Flambe",
          price: 69,
          description:
            "Hot cherries covered in liqueur and served with cream or ice cream.",
        },
        { name: "Ice Cream & Chocolate Sauce", price: 55 },
        { name: "Creme Brûlée", price: 55 },
        { name: "Caramel Slice", price: 55, description: "Served with cream." },
        { name: "Malva Pudding", price: 55, description: "Served with custard." },
        { name: "Cheese platter for one", price: 190 },
      ],
    },
    {
      id: "coffee",
      title: "Coffee",
      items: [
        { name: "Cappuccino", price: 37 },
        { name: "Coffee or Espresso", price: 32 },
        { name: "Double Espresso", price: 37 },
        { name: "Cafe Latte", price: 42 },
        { name: "Chai latte", price: 42 },
        { name: "Honey Pot", price: 10 },
        { name: "Irish Coffee", price: 65 },
        { name: "Dom Pedro", price: 65 },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Wine Cellar
// ---------------------------------------------------------------------------

const GLASS_BOTTLE = ["Glass", "Bottle"];

/** Wines print a bottle price and, for some, a glass price. */
function wine(
  name: string,
  bottle: Price,
  tastingNote?: string,
  glass?: Price,
): MenuItem {
  return {
    name,
    tastingNote,
    prices:
      glass === undefined
        ? [{ label: "Bottle", price: bottle }]
        : [
            { label: "Glass", price: glass },
            { label: "Bottle", price: bottle },
          ],
  };
}

const wineCellar: MenuCategory = {
  id: "wine-cellar",
  title: "Wine Cellar",
  inNavigator: true,
  sections: [
    {
      id: "champagne",
      title: "Champagne",
      priceColumns: ["Bottle"],
      items: [
        wine("Perrier Jouet Belle Epoque Brut", 6500),
        wine("Veuve Clicquot Rosé", 2125),
        wine("Veuve Clicquot Yellow Label Brut", 1900),
        wine("G.H. Mumm Demi Sec", 2050),
        wine("G.H. Mumm Rosé", 1850),
        wine("G.H. Mumm Brut", 1675),
        wine("Möet & Chandon Nectar Impérial", 1850),
        wine("Möet & Chandon Brut Impérial", 1500),
      ],
    },
    {
      id: "cap-classique",
      title: "Cap Classique",
      priceColumns: ["Bottle"],
      items: [
        wine("Graham Beck Brut", 465),
        wine("Krone Demi Sec Night Nectar Rosé", 405),
        wine("Simonsig Kaapse Vonkel Brut", 380),
        wine("Pongrácz Brut", 375),
        wine("Pongrácz Noble Nectar", 375),
      ],
    },
    {
      id: "sparkling-wine",
      title: "Sparkling Wine",
      priceColumns: ["Bottle"],
      items: [
        wine("Vondeling Little Sparkle", 250),
        wine("J.C. Le Roux Le Domaine", 195),
        wine("J.C. Le Roux La Chanson", 195),
        wine("J.C. Le Roux La Fleurette", 195),
        wine("J.C. Le Roux Le Domaine (Non Alcoholic)", 195),
      ],
    },
    {
      id: "prosecco",
      title: "Prosecco",
      priceColumns: ["Bottle"],
      items: [wine("Zonin", 285)],
    },
    {
      id: "coachman-house-wine",
      title: "Coachman House Wine",
      priceColumns: GLASS_BOTTLE,
      items: [
        wine(
          "Coachman Sauvignon Blanc",
          155,
          "Fresh with a lively tropical fruit character, green fig, pear and citrus with crisp acidity.",
          55,
        ),
        wine(
          "Coachman Rosé",
          155,
          "Tastes like pomegranate and raspberry. A medley of red fruits comes to life through this wine.",
          55,
        ),
        wine(
          "Coachman Cabernet Sauvignon",
          165,
          "Prominent flavours of cassis joined by a flurry of other dark fruit flavours.",
          59,
        ),
      ],
    },
    {
      id: "white-sauvignon-blanc",
      title: "White Wine — Sauvignon Blanc",
      priceColumns: GLASS_BOTTLE,
      items: [
        wine(
          "Springfield Life from Stone",
          350,
          "Stones have no flavour that they impart on wine; they simply make the soil less. Less soil means more concentrated fruit, same as older vines. As the rock opposes the vine, so does the nearby plant and age limit, growth and crop, thus the unmatched complexity of a great wine.",
        ),
        wine(
          "Neil Ellis Groenekloof",
          250,
          "Pale straw like colour with attractive green hues. Bright tropical aromatics, with subtle herbacious undertones. The palate is elegant with delicately detailed sweet tropical fruits and a lively acidity, refined minerality, poised palate, textured and a long flavoursome finish.",
          90,
        ),
        wine(
          "Tokara",
          235,
          "The entry is ripe and concentrated, with an abundance of Cape gooseberries, green apples and passion fruit flavours on the palate.",
        ),
        wine(
          "La Motte",
          215,
          "Engaging gooseberry followed by pineapple, lime and wild grass well balanced by a moderate acidity.",
        ),
        wine(
          "Diemersdal",
          195,
          "Vibrantly styled with distinctive aromas such as ripe figs and gooseberries and a harmonious finish.",
        ),
        wine(
          "Durbanville Hills",
          185,
          "Boasts of grapefruit, guava and passion fruit on the nose and citrus and tropical fruit on the palate.",
          65,
        ),
        wine(
          "KWV",
          165,
          "Sweet hay and freshly cut grass with layers of fruity flavours and a refreshing dry finish.",
        ),
        wine(
          "Spier Signature",
          160,
          "Pale gold with fresh lime green flashes around the edge. Aromas of full tropical fruit, yellow pepper, and herbal fynbos grassiness. Green pineapple, good balance of fruit and acidity.",
        ),
        wine(
          "Porcupine Ridge",
          145,
          "The nose shows fresh cut grass, capsicum and straw with hints of lime and granadilla fruit. Fresh fruitiness follows through onto the palate with a hint of nettles. The wine is very refreshing with a crisp, integrated acidity.",
          55,
        ),
      ],
    },
    {
      id: "white-chardonnay",
      title: "White Wine — Chardonnay",
      priceColumns: GLASS_BOTTLE,
      items: [
        wine(
          "Warwick The First Lady",
          235,
          "Yellow apples, white peach, and tropical fruits on the nose lead into pineapple, lime, and baked apple on the palate.",
        ),
        wine(
          "Fat Bastard",
          225,
          "A rich, golden yellow colour with complex aromas of vanilla and honeysuckle layered with subtle nuances of oak. On the palate, this wine has a full body with an eruption of tropical fruit flavours that develop into a long, toasty finish.",
        ),
        wine(
          "De Wetshof Limestone Hill",
          220,
          "Named after the vineyard's clay & lime rich soils imparting typical citrus fruit, also grapefruit and minerality.",
        ),
        wine(
          "Spier",
          160,
          "Grapefruit, lime, yellow apple, banana, pear and hints of vanilla and butterscotch on the nose. The palate is creamy with layered fruit, pleasant acidity and good balance.",
          60,
        ),
      ],
    },
    {
      id: "white-chenin-blanc",
      title: "White Wine — Chenin Blanc",
      priceColumns: GLASS_BOTTLE,
      items: [
        wine(
          "Mulderbosch Steen op Hout",
          195,
          "Lightly wooded. A powerful nose of guava, lime zest, ripe pear, honeysuckle and orange blossoms. A juicy palate with opulent passion fruit and a tart grapefruit finish.",
        ),
        wine(
          "Arum Fields",
          165,
          "Subtle tropical fruit dominated by ripe yellow peaches, quince, guava and white pear on the nose. Elegant and well-balanced structure with loads of tropical fruit on the palate and a fresh and crisp acidity followed by a lingering aftertaste.",
        ),
        wine(
          "Petit by Ken Forrester",
          150,
          "The freshness of quince, pear drops and crunchy green apple and grapefruit flavours.",
          55,
        ),
      ],
    },
    {
      id: "white-blends",
      title: "White Blends",
      priceColumns: GLASS_BOTTLE,
      items: [
        wine(
          "Haute Cabrière Chardonnay Pinot Noir",
          240,
          "An abundance of zesty fruit like white peach, litchi and red fruit, with a delectably full mouthfeel and balance.",
        ),
        wine(
          "Pierre Jourdan Tranquille",
          165,
          "The fragrant bouquet with red apples, cherries, red berries and lime flavours, with a note of earthiness on the nose, follow through perfectly on the palate.",
        ),
        wine("The Dawn", 130, "It's fresh and fruity and will add some sparkle to your day.", 49),
        wine(
          "Drostdy Hof Extra Light",
          120,
          "A generous, crisp, fresh and easy drinking wine of everyday pleasure.",
          45,
        ),
      ],
    },
    {
      id: "rose",
      title: "Rosé",
      priceColumns: GLASS_BOTTLE,
      items: [
        wine(
          "Protea by Anthonij Rupert",
          180,
          "Orange citrus notes of grapefruit and tangerine are apparent on entry, with fresh cut watermelon, wild flowers and lemon zest playing a supportive role.",
          65,
        ),
        wine(
          "Robertson Winery Natural Sweet",
          130,
          "A pale salmon pink colour with a fresh, lively delicate floral character. Very easy drinking.",
          49,
        ),
        wine(
          "Delaire Graff Cabernet Franc",
          305,
          "Ripe strawberries, cassis and candyfloss with dark red berries and cream on the mid-palate and a juicy, dry finish.",
        ),
      ],
    },
    {
      id: "red-cabernet-sauvignon",
      title: "Red Wine — Cabernet Sauvignon",
      priceColumns: GLASS_BOTTLE,
      items: [
        wine(
          "Springfield Whole Berry",
          450,
          "Made in the traditional way, harvested by hand, placed uncrushed into open to ferment with natural yeast. Followed by maturation in oak barrels for one year. The traditional wine is unfiltered and unfined; the result is a velvety wine with softer tannins and classical varietal characteristics.",
        ),
        wine(
          "Warwick The First Lady",
          240,
          "Deep dark fruits dominate with blackberry compote and black plum complemented with spicy aromatics of clove and cinnamon and a lovely hint of dried herb.",
        ),
        wine(
          "Ernie Els Big Easy",
          235,
          "Rich mouthfuls of cassis, fynbos, tobacco, liquorice and cedar. This wine personifies Ernie - popular and well loved, fun and engaging.",
          85,
        ),
        wine(
          "Nederburg Winemasters",
          230,
          "A layered, textured mouthful of hedgerow fruits, cassis, light leather and cigar box. Refined, elegant and svelte with a pleasant dryness that add to the long finish.",
        ),
      ],
    },
    {
      id: "red-merlot",
      title: "Red Wine — Merlot",
      priceColumns: GLASS_BOTTLE,
      items: [
        wine(
          "Diemersdal",
          265,
          "Mouth-filling blackberry with hints of cedar wood, with a follow-through of mint and spice flavours.",
        ),
        wine(
          "Villiera",
          240,
          "Hints of wood spice and mint with attractive red berry fruit. Rich and full with juicy soft tannins ensuring drinkability.",
        ),
        wine(
          "Guardian Peak",
          200,
          "The fresh, lingering, red fruit characteristics are well supported with soft vanilla flavours.",
        ),
        wine(
          "Durbanville Hills",
          190,
          "The wine displays aromas of berry fruit with hints of mint and oak. This Merlot is the ideal partner for robust dishes made from game, poultry, venison and red meats.",
          70,
        ),
        wine(
          "Porcupine Ridge",
          160,
          "Mid cerise with savoury plum and mulberry aromas. Fresh red fruit on the palate, well managed tannins, food friendly finish.",
          60,
        ),
      ],
    },
    {
      id: "red-shiraz",
      title: "Red Wine — Shiraz",
      priceColumns: GLASS_BOTTLE,
      items: [
        wine(
          "Delaire Graff",
          320,
          "Juicy, ripe and approachable with a spicy white pepper undertone, lavender, mulberries and a savoury finish.",
          115,
        ),
        wine(
          "Cape of Good Hope Riebeeksrivier",
          295,
          "The palate delivers black cherry, plum and dried herb flavours with a subtle punctuation of black pepper.",
        ),
        wine("Zonnebloem", 250, "Oak matured with whiffs of lily, dense fruit and supple tannins."),
        wine(
          "Guardian Peak",
          200,
          "Superb red fruit aromas of raspberry and plum with a subtle fynbos undertone.",
        ),
      ],
    },
    {
      id: "red-pinotage",
      title: "Red Wine — Pinotage",
      priceColumns: GLASS_BOTTLE,
      items: [
        wine(
          "Diemersdal",
          265,
          "Plum, mulberry, roasted banana, spices and rich dark chocolate flavours linger on the full flavoured palate.",
        ),
        wine(
          "Beyerskloof",
          220,
          "Strong berry and plum flavours with elegant tannins. Well balanced, medium-bodied wine with a fresh finish.",
          75,
        ),
      ],
    },
    {
      id: "red-blends",
      title: "Red Blends",
      priceColumns: GLASS_BOTTLE,
      items: [
        wine(
          "Rupert & Rothschild Classique",
          440,
          "Aromas of red plum, rasberries and cherries are prominent, layered with forest floor and oak spice expressed as toasted caramel and walnut. The palate has a fresh red fruit core with soft-textured tannins and good persistence.",
        ),
        wine(
          "Spier Creative Block 5",
          420,
          "Introduces complex flavours of dark berry fruit, dark chocolate, before leading onto a generous palate of berry fruit and layers of delight. Well balanced and full with a smooth finish of oak and perfume.",
        ),
        wine(
          "Mulderbosch Faithful Hound Red",
          375,
          "Spicy aromatics of cedarwood, anise and pencil shavings punctuated by intense cassis and mulberry notes.",
        ),
        wine(
          "La Motte Millennium",
          250,
          "Stylish raspberry, mulberry, cinnamon spice and a hint of mint as well as earthiness and discreet minerality.",
        ),
        wine(
          "Creation Whale Pod Syrah Merlot",
          210,
          "The complex nose tempts with a medley of dark berries and spice which are echoed on the plush palate. A beautifully structured wine with gorgeous hints of dark chocolate and a whisper of smoke on the lingering aftertase.",
        ),
      ],
    },
    {
      id: "port-sherry",
      title: "Port & Sherry",
      items: [
        { name: "Boplaas Cape Ruby", price: 30 },
        { name: "Allesverloren Fine Old Vintage", price: 30 },
        { name: "Monis (Sherry)", price: 30 },
      ],
    },
  ],
};

/**
 * The Luxury Collection — the premium red tier, printed on its own black page
 * with the blackletter logo. Rendered as its own homepage section (Silk
 * background) as well as inside the wine cellar on /menu.
 */
export const luxuryCollection: MenuSection = {
  id: "luxury-collection",
  title: "Luxury Collection",
  items: [
    {
      name: "Meerlust Rubicon",
      price: 985,
      tastingNote:
        "Exotic aromas of plum, sandalwood and a touch of creamy vanilla with cassis and mulberry flavours.",
    },
    {
      name: "Tokara Director's Reserve Red",
      price: 950,
      tastingNote:
        "A 5-star rated wine that has gained top awards, including Double Gold Veritas! A blend of Cabernet Sauvignon, Petit Verdot, Merlot and Malbec. The wine shows notes of blackcurrant, Christmas cake and a hint of mint.",
    },
    {
      name: "De Grendel Rubaiyat",
      price: 850,
      tastingNote:
        "The farm's flagship red has perfume of graphite, cassis, cedar and liquorice, with a touch of wood smoke that evolves in the glass.",
    },
    {
      name: "Grangehurst Pinotage",
      price: 625,
      tastingNote:
        "Red berry and plum fruitiness with vanilla, oak and spice. Full on the palate with smooth, robust tannins.",
    },
    {
      name: "Delaire Graff Botmaskop",
      price: 620,
      tastingNote:
        "Rich aromas of cassis and spice with intense liquorice and blackberry flavours and fine, lingering tannins.",
    },
    {
      name: "The Chocolate Block",
      price: 500,
      tastingNote:
        "Bitter dark chocolate on the palate with black fruit, hints of smokey minerality and oak spice.",
    },
    {
      name: "Anthonij Rupert Optima",
      price: 465,
      tastingNote:
        "The silky, plush textured palate is full of ripe plums, hedgerow fruit, cocoa, spice and cigarbox flavours that makes for an enveloping mouthfeel. Complex and elegant, the oak harmonizes with the fruit, ending with a lingering intergrated finish.",
    },
    {
      name: "La Motte Syrah",
      price: 430,
      tastingNote:
        "Shiraz grapes of a number of cool terroirs captures juicy berry-fruit, sweet liquorice, violet flowers and pepper spice.",
    },
    {
      name: "Diemersdal Private Collection",
      price: 395,
      tastingNote:
        "A Bordeaux-styled blend with dark chocolate, enticing cedar, wafting blackberry jam, cherry, cassis and vanilla notes.",
    },
    {
      name: "Beyerskloof Pinotage Reserve",
      price: 365,
      tastingNote:
        "Blackberry and plum flavours upon entry with light hints of cedar oak aromas from barrel maturation.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Bar
// ---------------------------------------------------------------------------

export const bar: MenuCategory = {
  id: "bar",
  title: "Bar",
  inNavigator: false,
  sections: [
    {
      id: "blended-scotch-whisky",
      title: "Blended Scotch Whisky",
      items: [
        { name: "Johnnie Walker Blue", price: 250 },
        { name: "Johnnie Walker Gold 18 YO", price: 135 },
        { name: "Johnnie Walker Green", price: 85 },
        { name: "Johnnie Walker Black", price: 40 },
        { name: "Johnnie Walker Red", price: 30 },
        { name: "Chivas Regal 18 YO", price: 100 },
        { name: "Chivas Regal", price: 40 },
        { name: "Singleton", price: 50 },
        { name: "Scottish Leader", price: 35 },
        { name: "Bain's", price: 30 },
        { name: "Ballantine's", price: 30 },
        { name: "Bell's", price: 30 },
        { name: "Black Grouse", price: 30 },
        { name: "J&B", price: 30 },
      ],
    },
    {
      id: "speyside-single-malt-whisky",
      title: "Speyside Single Malt Whisky",
      items: [
        { name: "The Glenlivet 21 YO", price: 330 },
        { name: "The Glenlivet 15 YO", price: 90 },
        { name: "Glenfiddich 18 YO", price: 160 },
        { name: "Glenfiddich 12 YO", price: 60 },
        { name: "Glenmorangie Original", price: 60 },
      ],
    },
    {
      id: "blended-irish-whiskey",
      title: "Blended Irish Whiskey",
      items: [
        { name: "Jameson Select Reserve", price: 46 },
        { name: "Jameson Caskmates", price: 40 },
        { name: "Jameson", price: 36 },
        { name: "Tullamore Dew", price: 35 },
      ],
    },
    {
      id: "tennessee-whiskey",
      title: "Tennessee Whiskey",
      items: [
        { name: "Jack Daniel's Single Barrel", price: 65 },
        { name: "Gentleman Jack", price: 40 },
        { name: "Jack Daniel's", price: 34 },
        { name: "Jack Daniel's Honey", price: 34 },
      ],
    },
    {
      id: "cognac",
      title: "Cognac",
      items: [
        { name: "Remy Martin VSOP", price: 80 },
        { name: "Hennessy VS", price: 50 },
      ],
    },
    {
      id: "brandy",
      title: "Brandy",
      items: [
        { name: "KWV 20 YO", price: 150 },
        { name: "KWV 15 YO", price: 75 },
        { name: "KWV 10 YO", price: 40 },
        { name: "KWV 5 YO", price: 35 },
        { name: "KWV 3 YO", price: 30 },
        { name: "Klipdrift Premium", price: 35 },
        { name: "Klipdrift, Richelieu", price: 30 },
      ],
    },
    {
      id: "rum",
      title: "Rum",
      items: [
        { name: "Captain Morgan Spiced Gold", price: 30 },
        { name: "Red Heart", price: 30 },
        { name: "Stroh", price: 45 },
        { name: "Bacardi", price: 30 },
      ],
    },
    {
      id: "vodka",
      title: "Vodka",
      items: [
        { name: "Belvedere", price: 40 },
        { name: "Absolut", price: 35 },
        { name: "Wyborowa", price: 30 },
      ],
    },
    {
      id: "cane",
      title: "Cane",
      items: [{ name: "Cape to Rio", price: 30 }],
    },
    {
      id: "gin",
      title: "Gin",
      items: [
        { name: "Hendricks", price: 46 },
        { name: "Bulldog, Musgrave Pink", price: 40 },
        { name: "Beefeater", price: 35 },
        { name: "Tanqueray", price: 35 },
        { name: "Gordon's London Dry", price: 30 },
      ],
    },
    {
      id: "liqueurs",
      title: "Liqueurs",
      items: [
        { name: "Drambuie", price: 40 },
        { name: "Jägermeister", price: 38 },
        { name: "Cointreau", price: 38 },
        { name: "Amaretto", price: 35 },
        { name: "Kahlúa, Frangelico", price: 32 },
        { name: "Amarula, Peppermint, Banana", price: 30 },
        { name: "Van Der Hum, Blue Curacao, Ginger", price: 30 },
        { name: "Strawberry, Cape Velvet", price: 30 },
        { name: "Southern Comfort", price: 30 },
      ],
    },
    {
      id: "aperitifs",
      title: "Aperitifs",
      items: [
        { name: "Aperol Spritz", price: 90 },
        { name: "Grappa", price: 70 },
        { name: "Underberg", price: 60 },
        { name: "Martini, Cinzano", price: 30 },
        { name: "Campari", price: 30 },
        { name: "Ouzo", price: 30 },
      ],
    },
    {
      id: "ciders",
      title: "Ciders",
      items: [
        { name: "Strongbow Golden Apple/Red Berry", price: 38 },
        { name: "Hunter's Gold/Dry", price: 36 },
        { name: "Savanna Dry & Light", price: 36 },
        { name: "Flying Fish Lemon", price: 35 },
      ],
    },
    {
      id: "beers",
      title: "Beers",
      items: [
        { name: "Guinness", price: 49 },
        { name: "Heineken, Miller", price: 40 },
        { name: "Windhoek Draught (Bottle 440ml)", price: 40 },
        { name: "Sol Mexican Beer, Corona", price: 38 },
        { name: "Castle Light, Windhoek Lager,", price: 35 },
        { name: "Black Label, Amstel", price: 35 },
        { name: "Castle, Hansa", price: 33 },
      ],
    },
    {
      id: "draught-beer",
      title: "Draught Beer",
      priceColumns: ["300ml", "500ml"],
      items: [
        {
          name: "Jack Black",
          prices: [
            { label: "300ml", price: 45 },
            { label: "500ml", price: 55 },
          ],
        },
        {
          name: "Stella Artois",
          prices: [
            { label: "300ml", price: 40 },
            { label: "500ml", price: 50 },
          ],
        },
        {
          name: "Castle Light",
          prices: [
            { label: "300ml", price: 37 },
            { label: "500ml", price: 48 },
          ],
        },
        {
          name: "Heineken",
          prices: [
            { label: "300ml", price: 37 },
            { label: "500ml", price: 48 },
          ],
        },
        {
          name: "Windhoek",
          prices: [
            { label: "300ml", price: 37 },
            { label: "500ml", price: 48 },
          ],
        },
      ],
    },
    {
      id: "soft-drinks",
      title: "Soft Drinks",
      items: [
        { name: "Red Bull", price: 42 },
        { name: "Juice, Appletiser, Grapetizer", price: 36 },
        { name: "Tomato Cocktail", price: 52 },
        { name: "Lipton", price: 32 },
        { name: "Coke Light, Sprite, Sprite Zero", price: 30 },
        { name: "Fanta, Creme Soda", price: 30 },
        { name: "Coke, Lemonade, Ginger Ale, Soda", price: 26 },
        { name: "Dry Lemon, Tonic Water", price: 26 },
        { name: "750ml Sparkling or Still Water Valpre", price: 40 },
        { name: "350ml Sparkling or Still Water Valpre", price: 27 },
      ],
    },
    {
      id: "non-alcoholic",
      title: "Non-Alcoholic",
      items: [
        { name: "Heineken Zero", price: 40 },
        { name: "Savanna", price: 40 },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

/** Every category, in printed-menu order. Drives /menu. */
export const menu: MenuCategory[] = [
  starters,
  seafood,
  charcoalGrill,
  southAfricanTraditional,
  burgers,
  desserts,
  wineCellar,
  bar,
];

/** The six Flowing Menu navigator rows (CLAUDE.md §Page structure item 5). */
export const navigatorCategories: MenuCategory[] = menu.filter((c) => c.inNavigator);

/** The four Spotlight Card dishes (CLAUDE.md §Page structure item 6). */
export const saTraditionalDishes: MenuItem[] =
  southAfricanTraditional.sections[0].items;
