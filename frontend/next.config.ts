import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gd.image-qoo10.jp, mysingle.io",
      },
    ],
  },
};

export default nextConfig;
