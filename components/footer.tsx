import Image from "next/image";
import Link from "next/link";

const pages = [
  { label: "Home", href: "/" },
  { label: "R&D", href: "/rnd" },
  { label: "Projects", href: "/projects" },
  { label: "Team", href: "/team" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

const company = [
  { label: "Mission", href: "/#about" },
  { label: "Kaunas, Lithuania", href: "/contact" },
  { label: "Cloud Seeding", href: "/cloud-seeding" },
];

const social = [
  { label: "YouTube", href: "https://www.youtube.com/@thunderclaplabs" },
  { label: "Instagram", href: "https://www.instagram.com/thunderclaplabs/" },
  { label: "Facebook", href: "https://www.facebook.com/thunderclaplabs" },
];

export function Footer() {
  return (
    <footer
      style={{
        background: "var(--color-bg)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        paddingTop: "49px",
        paddingBottom: "49px",
      }}
    >
      <div className="container-content">
        {/* Top row: logo + columns */}
        <div className="flex flex-col md:flex-row gap-12 md:gap-0 justify-between">
          {/* Logo */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center no-underline">
              <Image
                src="/logo.png"
                alt="Thunderclap Labs Logo"
                height={36}
                width={160}
                style={{ height: "2.25rem", width: "auto" }}
              />
            </Link>
            <p
              className="body-text"
              style={{ color: "var(--color-text-muted)", maxWidth: "220px" }}
            >
              Engineering next-generation aerospace and atmospheric technologies.
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-3 gap-10 md:gap-16">
            <div className="flex flex-col gap-3">
              <span
                className="eyebrow"
                style={{ color: "var(--color-text-muted)" }}
              >
                Pages
              </span>
              {pages.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-white no-underline"
                  style={{
                    fontSize: "15.75px",
                    letterSpacing: "-0.154px",
                    lineHeight: "105%",
                    opacity: 0.7,
                    transition: "opacity 0.3s ease-out",
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <span
                className="eyebrow"
                style={{ color: "var(--color-text-muted)" }}
              >
                Company
              </span>
              {company.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-white no-underline"
                  style={{
                    fontSize: "15.75px",
                    letterSpacing: "-0.154px",
                    lineHeight: "105%",
                    opacity: 0.7,
                    transition: "opacity 0.3s ease-out",
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <span
                className="eyebrow"
                style={{ color: "var(--color-text-muted)" }}
              >
                Social
              </span>
              {social.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white no-underline"
                  style={{
                    fontSize: "15.75px",
                    letterSpacing: "-0.154px",
                    lineHeight: "105%",
                    opacity: 0.7,
                    transition: "opacity 0.3s ease-out",
                  }}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 mt-12 pt-6"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <span
            style={{
              fontSize: "10.5px",
              letterSpacing: "0.42px",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
            }}
          >
            © {new Date().getFullYear()} Thunderclap Labs. All rights reserved.
          </span>
          <a
            href="mailto:contact@thunderclaplabs.com"
            className="text-white no-underline"
            style={{
              fontSize: "10.5px",
              letterSpacing: "0.42px",
              textTransform: "uppercase",
              opacity: 0.5,
              transition: "opacity 0.3s ease-out",
            }}
          >
            contact@thunderclaplabs.com
          </a>
        </div>
      </div>
    </footer>
  );
}
