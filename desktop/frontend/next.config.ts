import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint errors during `next build`
  },
  devIndicators: false
};

export default nextConfig;
