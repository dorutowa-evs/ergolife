import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'static2.flymee.jp' },
      { protocol: 'https', hostname: 'btod-delta-store.s3.amazonaws.com' },
      { protocol: 'https', hostname: 'images.steelcase.com' },
      { protocol: 'https', hostname: 'images.hermanmiller.group' },
      { protocol: 'https', hostname: 'cdn11.bigcommerce.com' },
      { protocol: 'https', hostname: 'cdn.autonomous.ai' },
      { protocol: 'https', hostname: 'comebackgoods.com' },
      { protocol: 'https', hostname: 'floydhome.com' },
    ],
  },
};

export default nextConfig;
