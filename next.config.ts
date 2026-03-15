import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'flatfox.ch' },
      { protocol: 'https', hostname: 'recyoezvcfiarmeizgqc.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  async rewrites() {
    return [
      { source: '/', destination: '/landing.html' },
      { source: '/ebook', destination: '/ebook.html' },
    ];
  },
};
export default nextConfig;
