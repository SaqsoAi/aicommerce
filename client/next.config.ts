import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/ProductCatalog",
        destination: "/shop",
        permanent: true,
      },
      {
        source: "/SizeFitCentre",
        destination: "/size-fit-center",
        permanent: true,
      },
    ];
  },

  async rewrites() {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

    return [
      {
        source: "/uploads/:path*",
        destination: `${serverUrl}/uploads/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${serverUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

