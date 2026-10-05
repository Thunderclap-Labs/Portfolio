import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Dev only. Next blocks cross-origin requests to dev assets, which breaks
     HMR when the dev server is opened from a phone or another machine on the
     LAN by IP rather than through localhost. */
  allowedDevOrigins: ["172.20.10.*", "192.168.*.*", "10.*.*.*"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
