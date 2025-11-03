import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
 images: {
    unoptimized: true, // This disables Next.js image optimization but allows any URL
    // OR use:
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow any HTTPS domain
        pathname: '**', // Allow any path
      },
      {
        protocol: 'http',
        hostname: '**', // Allow any HTTP domain  
        pathname: '**',
      },
    ],
  },
}

module.exports = nextConfig

export default nextConfig;
