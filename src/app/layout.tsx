import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";
import { CookieBanner } from "@/components/layout/cookie-banner";
import "./globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://vibehunt.games";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "VibeHunt — Discover, Play & Trade Vibecoded Games",
    template: "%s | VibeHunt",
  },
  description:
    "The launchpad for vibecoded games. Discover new games daily, play instantly in your browser, and trade game projects on the marketplace.",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: "website",
    siteName: "VibeHunt",
    title: "VibeHunt — Discover, Play & Trade Vibecoded Games",
    description:
      "The launchpad for vibecoded games. Discover new games daily, play instantly in your browser.",
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "VibeHunt — Discover, Play & Trade Vibecoded Games",
    description:
      "The launchpad for vibecoded games. Discover new games daily, play instantly in your browser.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>
          <QueryProvider>{children}</QueryProvider>
          <CookieBanner />
        </AuthProvider>
      </body>
    </html>
  );
}
