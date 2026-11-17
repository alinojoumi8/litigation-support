import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { PRODUCT_NAME } from "@/lib/brand";
import "./globals.css";

const atkinson = localFont({
  src: [
    { path: "./fonts/atkinson-hyperlegible-next-latin-wght-normal.woff2", style: "normal", weight: "200 800" },
    { path: "./fonts/atkinson-hyperlegible-next-latin-wght-italic.woff2", style: "italic", weight: "200 800" },
  ],
  variable: "--font-atkinson",
  display: "swap",
});

const newsreader = localFont({
  src: [
    { path: "./fonts/newsreader-latin-opsz-normal.woff2", style: "normal", weight: "200 800" },
    { path: "./fonts/newsreader-latin-opsz-italic.woff2", style: "italic", weight: "200 800" },
  ],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${PRODUCT_NAME}: a case preparation workspace for Ontario`,
    template: `%s · ${PRODUCT_NAME}`,
  },
  description:
    "Turn your emails and documents into an organized case file: plain-language summaries, one master timeline, and flags where things don't line up. Legal information, not legal advice.",
  referrer: "no-referrer",
};

export const viewport: Viewport = {
  themeColor: "#f6f3ec",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-CA" className={`${atkinson.variable} ${newsreader.variable} antialiased`}>
      <body className="min-h-dvh bg-paper text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
