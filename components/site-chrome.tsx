"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";

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
    <>
      {navbar}
      <main className="flex-1 overflow-hidden">{children}</main>
      <Footer />
    </>
  );
}
