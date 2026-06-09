import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disables TypeScript error checks during production builds on Vercel
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
