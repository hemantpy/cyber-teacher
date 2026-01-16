import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable X-Powered-By header
  poweredByHeader: false,

  // Security headers (backup to middleware)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'same-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), usb=(), bluetooth=(), payment=()'
          }
        ]
      }
    ];
  },

  // Experimental features
  experimental: {
    // Enable server actions if needed
  },
};

export default nextConfig;
