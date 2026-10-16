import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import "./globals.css";

// Inter is variable, so one preloaded file covers every weight on the page.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Only used below the fold (calculator values, code block), so no preload.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Clipstake: Pay only for verified views",
  description:
    "Clipstake turns thousands of short-form clippers into your distribution channel. Set your CPM, brief the campaign, and only pay for verified views on TikTok, Reels, Shorts and X.",
};

export const viewport: Viewport = {
  themeColor: "#fafafa",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Marks JS-enabled renders so JS-only states (stat counters) can hide
            their SSR text without hiding it for no-JS visitors. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
