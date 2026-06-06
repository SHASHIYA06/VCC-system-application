import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enhanced bundle optimization for Vercel deployment
  experimental: {
    // Enable modern bundling optimizations
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-slot',
      'framer-motion'
    ],
  },
  
  // Move heavy packages out of serverless functions (excluding react-pdf due to CSS issues)
  serverExternalPackages: [
    'playwright',
    'puppeteer',
    'langchain', 
    '@langchain/community',
    '@langchain/core',
    '@langchain/openai',
    '@anthropic-ai/sdk',
    'pdf-parse',
    'pdfjs-dist',
    'pdf-lib',
    'mongodb',
    'pg',
    'postgres',
    'sharp',
    'canvas'
  ],
  
  // Enable Turbopack with empty config to suppress warning
  turbopack: {},

  // Output and compression optimizations
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  
  // Image optimizations for Vercel
  images: {
    domains: [],
    unoptimized: true,
    minimumCacheTTL: 31536000, // 1 year cache
  },
  
  // Disable development features in production
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  
  // Reduce server response size
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
