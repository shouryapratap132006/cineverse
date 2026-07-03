import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import AppProviders from "@/components/provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CineVerse | Where Cinema Meets Community",
  description:
    "A premium social platform for cinephiles. Discover movies, track your watchlist, share reviews, connect with active movie clubs, and explore films with an AI Companion.",
  keywords: ["movies", "cinema", "letterboxd", "social network", "reviews", "watchlist", "AI recommendations"],
  authors: [{ name: "CineVerse Team" }],
  openGraph: {
    title: "CineVerse | Where Cinema Meets Community",
    description: "Discover films, connect with communities, write reviews, and explore cinema with AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} h-full antialiased dark`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full bg-brand-dark text-slate-100 font-sans antialiased flex flex-col selection:bg-brand-purple/30 selection:text-white">
        <AppProviders>
          {/* Subtle cinematic atmosphere elements */}
          <div className="film-grain" />
          <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            <div className="animate-pulse-slow absolute -top-[40%] -left-[20%] h-[80%] w-[60%] rounded-full bg-brand-blue opacity-15 blur-[120px]" />
            <div className="animate-pulse-slow absolute top-[60%] -right-[10%] h-[70%] w-[50%] rounded-full bg-brand-purple opacity-15 blur-[120px]" />
          </div>
          <div className="relative z-10 flex-grow flex flex-col">{children}</div>
        </AppProviders>
      </body>
    </html>
  );
}
