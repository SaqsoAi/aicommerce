import type { NextConfig } from "next";

const serverUrl = (
  process.env.NEXT_PUBLIC_SERVER_URL ||
  "https://ai-commerce-0zft.onrender.com"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/store-settings",
        destination: "/enterprise-store-settings",
      },
      {
        source: "/api/:path*",
        destination: `${serverUrl}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${serverUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
