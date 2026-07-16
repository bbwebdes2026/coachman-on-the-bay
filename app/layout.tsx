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
  openGraph: {
    title: "The Coachman — Fine dining on the bay",
    description:
      "A fine-dining steakhouse and seafood institution on the beachfront in Gqeberha, South Africa.",
    locale: "en_ZA",
    type: "website",
  },
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
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
