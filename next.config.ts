import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'flatfox.ch' },
    ],
  },
  async rewrites() {
    return [
      { source: '/', destination: '/landing.html' },
    ];
  },
};
export default nextConfig;
