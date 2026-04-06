import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'flatfox.ch' },
      { protocol: 'https', hostname: 'recyoezvcfiarmeizgqc.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      { source: '/', destination: '/landing.html' },
      { source: '/ebook', destination: '/ebook.html' },
    ];
  },
};
export default withSentryConfig(nextConfig, {
  org: "vasicek",
  project: "poker",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
});
