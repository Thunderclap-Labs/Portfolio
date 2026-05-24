import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/lib/sanity/image";
import type { SanityImage } from "@/lib/sanity/queries";

export interface RelatedItem {
  href: string;
  title: string;
  subtitle?: string;
  image?: SanityImage;
}

interface RelatedListProps {
  items: RelatedItem[];
}

/**
 * Compact list of cross-referenced items rendered with a square thumbnail,
 * title, and optional subtitle. Designed for the dark detail-page sidebars.
 */
export function RelatedList({ items }: RelatedListProps) {
  return (
    <ul className="list-none m-0 p-0 flex flex-col gap-3">
      {items.map((item) => {
        const thumb = item.image
          ? urlFor(item.image).width(160).height(160).fit("crop").auto("format").url()
          : null;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group flex items-center gap-3 no-underline"
            >
              {thumb ? (
                <div className="relative shrink-0 w-12 h-12 overflow-hidden bg-white/5">
                  <Image
                    src={thumb}
                    alt={item.image?.alt ?? item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="48px"
                  />
                </div>
              ) : (
                <div className="shrink-0 w-12 h-12 bg-white/5 border border-white/10" />
              )}
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-medium leading-[125%] tracking-[-0.135px] text-white group-hover:text-accent transition-colors duration-300 truncate">
                  {item.title}
                </div>
                {item.subtitle && (
                  <div className="text-[11.5px] tracking-[-0.05px] text-white/45 mt-0.5 truncate">
                    {item.subtitle}
                  </div>
                )}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
