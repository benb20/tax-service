import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    appIsrStatus: false,
    buildActivity: true,
    buildActivityPosition: 'bottom-right'
  },
  
  // Add the redirects method to handle automatic redirection
  async redirects() {
    return [
      {
        source: '/',
        destination: '/transactions',
        permanent: true, // Permanent redirect
      },
    ];
  },
};

export default nextConfig;
