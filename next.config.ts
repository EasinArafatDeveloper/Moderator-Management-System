import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disables ESLint execution during production builds on Vercel
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
