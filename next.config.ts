import type { NextConfig } from "next";

/**
 * @type {import('next').NextConfig}
 */
const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      "images.unsplash.com",
      "plus.unsplash.com",
      "scontent-los2-1.cdninstagram.com",
      "fra1.digitaloceanspaces.com",
    ].map((hostname) => ({
      protocol: "https",
      hostname,
      port: "",
    })),
  },
};

export default nextConfig;
