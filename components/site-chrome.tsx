"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStudio = pathname.startsWith("/studio");

  if (isStudio) return <>{children}</>;

  return (
    <>
      <Navbar />
      <main className="flex-1 overflow-hidden">{children}</main>
      <Footer />
    </>
  );
}
