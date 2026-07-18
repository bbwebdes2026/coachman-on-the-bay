import { menu } from "./menu";

/**
 * Structured data for the site (schema.org), kept as typed objects so the JSON-LD
 * stays maintainable and type-checked rather than hand-written strings. Rendered
 * via <JsonLd> — the Restaurant node site-wide from the root layout, the Menu node
 * on /menu.
 *
 * Content facts confirmed by the owner (2026-07-18): founded 1978; address Brookes
 * on the Bay, Summerstrand, Gqeberha 6001; trading Mon–Sat 11:30–22:00, Sun until
 * 21:00. The human-readable equivalents live on CONTACT in ./menu (for the footer).
 */

interface PostalAddress {
  "@type": "PostalAddress";
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
}

interface OpeningHoursSpecification {
  "@type": "OpeningHoursSpecification";
  dayOfWeek: string | string[];
  opens: string;
  closes: string;
}

interface RestaurantSchema {
  "@context": "https://schema.org";
  "@type": "Restaurant";
  name: string;
  image: string;
  url: string;
  telephone: string;
  servesCuisine: string[];
  priceRange: string;
  foundingDate: string;
  address: PostalAddress;
  sameAs: string[];
  openingHoursSpecification: OpeningHoursSpecification[];
}

export const restaurantJsonLd: RestaurantSchema = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "The Coachman Restaurant",
  image: "https://www.tcr.co.za/images/terrace-bay.jpg",
  url: "https://www.tcr.co.za",
  telephone: "+27415840087",
  servesCuisine: ["Steakhouse", "Seafood", "South African"],
  priceRange: "$$$",
  foundingDate: "1978",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Brookes on the Bay",
    addressLocality: "Summerstrand, Gqeberha",
    addressRegion: "Eastern Cape",
    postalCode: "6001",
    addressCountry: "ZA",
  },
  sameAs: ["https://www.facebook.com/coachmanonthebay"],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "11:30",
      closes: "22:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Sunday",
      opens: "11:30",
      closes: "21:00",
    },
  ],
};

interface MenuSectionSchema {
  "@type": "MenuSection";
  name: string;
}

interface MenuSchema {
  "@context": "https://schema.org";
  "@type": "Menu";
  name: string;
  url: string;
  inLanguage: string;
  hasMenuSection: MenuSectionSchema[];
}

// The Menu reference emitted on /menu — its sections derived from the single menu
// source so they never drift from what the page actually renders.
export const menuJsonLd: MenuSchema = {
  "@context": "https://schema.org",
  "@type": "Menu",
  name: "The Coachman Restaurant — Menu",
  url: "https://www.tcr.co.za/menu",
  inLanguage: "en-ZA",
  hasMenuSection: menu.map((category) => ({
    "@type": "MenuSection",
    name: category.title,
  })),
};
