import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed experimental.turbo as it's not a valid config option in Next.js 16
  // Added Turbopack ignore to prevent tracing entire project
  experimental: {
    outputFileTracingIncludes: {
      "**/pdf-extraction.ts": ["./node_modules/pdf-lib/**/*"],
    },
  },
};

export default nextConfig;
