import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove 'output: export' - Vercel handles this automatically
  images: {
    unoptimized: true, // Keep this if you're not using next/image optimization
  },
};

export default nextConfig;