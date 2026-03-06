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
      { protocol: 'https', hostname: 'images.secretlab.co' },
      { protocol: 'https', hostname: 'www.ikea.com' },
      { protocol: 'https', hostname: 'www.sihoo.com' },
      { protocol: 'https', hostname: 's3.springbeetle.eu' },
      { protocol: 'https', hostname: 'assets2.razerzone.com' },
      { protocol: 'https', hostname: 'www.ticova.net' },
      { protocol: 'https', hostname: 'www.odinlake.com' },
      { protocol: 'https', hostname: 'duramontchairs.com' },
    ],
  },
};

export default nextConfig;
