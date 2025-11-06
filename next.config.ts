import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove output: 'export' to enable image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow any HTTPS domain
      },
      {
        protocol: 'http',
        hostname: '**', // Allow any HTTP domain
      },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  trailingSlash: true,
}

export default nextConfig;