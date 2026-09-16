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
  title: "Thunderclap Labs | Web Design & Development",
  description:
    "We design and build websites and web apps from Kaunas, Lithuania — 3D product pages, configurators, storefronts, dashboards and internal tools, engineered end-to-end.",
  keywords: [
    "web design",
    "web development",
    "Next.js",
    "3D web",
    "WebGL",
    "ecommerce",
    "web apps",
    "Kaunas",
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
    title: "Thunderclap Labs | Web Design & Development",
    description:
      "Websites and web apps built end-to-end from Kaunas, Lithuania.",
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
