import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/store-settings",
        destination: "/enterprise-store-settings",
      },
      {
        source: "/api/:path*",
        destination: "https://onrender.com*",
      },
      {
        source: "/uploads/:path*",
        destination: "https://onrender.com*",
      },
    ];
  },
};

export default nextConfig;