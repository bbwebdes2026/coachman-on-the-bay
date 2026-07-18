import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Hanken_Grotesk } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

// Display — headings, dish names, large numerals
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
});

// Body / UI — body copy, menu descriptions, nav, buttons
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-hanken",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tcr.co.za"),
  title: {
    default: "The Coachman — Fine dining on the bay, Gqeberha",
    template: "%s · The Coachman",
  },
  description:
    "The Coachman Restaurant — a fine-dining steakhouse and seafood institution on the beachfront in Gqeberha (Port Elizabeth), South Africa.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "The Coachman — Fine dining on the bay",
    description:
      "A fine-dining steakhouse and seafood institution on the beachfront in Gqeberha, South Africa.",
    url: "/",
    siteName: "The Coachman",
    locale: "en_ZA",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "The Coachman — fine dining on the bay, Gqeberha.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Coachman — Fine dining on the bay",
    description:
      "A fine-dining steakhouse and seafood institution on the beachfront in Gqeberha, South Africa.",
    images: ["/og-image.jpg"],
  },
};

// Restaurant schema (schema.org), emitted site-wide from the root layout so every
// page carries it. metadataBase makes the relative URLs below resolve to absolute.
const restaurantJsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "The Coachman",
  description:
    "A fine-dining steakhouse and seafood institution on the beachfront in Gqeberha (Port Elizabeth), South Africa.",
  image: "https://www.tcr.co.za/og-image.jpg",
  url: "https://www.tcr.co.za",
  telephone: "+27 41 584 0087",
  servesCuisine: ["Steakhouse", "Seafood", "South African"],
  priceRange: "$$$",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Gqeberha",
    addressRegion: "Eastern Cape",
    addressCountry: "ZA",
  },
  hasMenu: "https://www.tcr.co.za/menu",
  sameAs: ["https://www.facebook.com/coachmanonthebay"],
  // TODO(owner): add openingHoursSpecification once the trading hours are confirmed.
  // e.g. { "@type": "OpeningHoursSpecification", dayOfWeek: [...], opens: "12:00", closes: "22:00" }
};

export const viewport: Viewport = {
  themeColor: "#0A1220",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en-ZA"
      className={`${cormorant.variable} ${hanken.variable}`}
    >
      <body className="min-h-screen bg-midnight text-silver-100 font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }}
        />
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
