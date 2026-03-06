import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Only IKEA Markus still uses a remote image (IKEA blocks direct downloads)
      { protocol: 'https', hostname: 'www.ikea.com' },
    ],
  },
};

export default nextConfig;
