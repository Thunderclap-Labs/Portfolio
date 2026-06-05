"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";
import { PageTransition } from "@/components/transition/page-transition";

export function SiteChrome({
  children,
  navbar,
}: {
  children: React.ReactNode;
  navbar: React.ReactNode;
}) {
  const pathname = usePathname();
  const isStudio = pathname.startsWith("/studio");

  if (isStudio) return <>{children}</>;

  return (
    <PageTransition>
      {navbar}
      <main className="flex-1 overflow-hidden">{children}</main>
      <Footer />
    </PageTransition>
  );
}
