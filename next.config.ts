import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // =============================================
  // Performance & Build Optimization
  // =============================================

  // Standalone output for optimized deployment (~80% smaller builds)
  output: 'standalone',

  // Deep tree-shaking for heavy libraries
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'framer-motion',
      'date-fns',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-popover',
      '@radix-ui/react-separator',
      '@radix-ui/react-switch',
    ],
  },

  // Image optimization with modern formats
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // =============================================
  // Security Headers
  // =============================================
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://*.supabase.co; connect-src 'self' https://*.supabase.co https://*.anthropic.com https://*.openai.com; font-src 'self' data:; frame-src 'self'; upgrade-insecure-requests;",
          },
        ],
      },
      // Immutable cache for Next.js static assets (JS/CSS bundles)
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },

  // Additional security configurations
  poweredByHeader: false, // Remove X-Powered-By header

  // Strict mode for React
  reactStrictMode: true,
};

export default nextConfig;
