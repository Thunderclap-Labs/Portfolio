import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { SiteChrome } from "@/components/site-chrome";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Thunderclap Labs | Aerospace & Engineering",
  description:
    "Pioneering next-generation aerospace and atmospheric technologies. We specialize in advanced propulsion, weather modification, satellite systems, and active defense tech.",
  keywords: [
    "aerospace",
    "defense",
    "propulsion",
    "cloud seeding",
    "atmospheric technology",
    "satellite systems",
    "thunder eye",
    "Lithuania",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", rel: "shortcut icon" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
  manifest: "/site.webmanifest",
  appleWebApp: { title: "Thunderclap Labs" },
  openGraph: {
    title: "Thunderclap Labs | Aerospace & Engineering",
    description:
      "Engineering the future of aerospace and atmospheric technologies from Kaunas, Lithuania.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col overflow-x-hidden bg-bg">
        <SiteChrome navbar={<Navbar />}>{children}</SiteChrome>
      </body>
    </html>
  );
}
