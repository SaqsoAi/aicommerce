import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Next/webpack file tracing inside the client project. The deployment
  // also has a root lockfile, which otherwise makes Windows watch D:\\.
  outputFileTracingRoot: process.cwd(),
  turbopack: {
    root: process.cwd(),
  },

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

    // Fallback rewrites run only after local App Router handlers. This keeps
    // /api/backend/[...path] on the storefront origin while still proxying all
    // legacy /api/* and /uploads/* calls to Express.
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        {
          source: "/uploads/:path*",
          destination: `${serverUrl}/uploads/:path*`,
        },
        {
          source: "/api/:path*",
          destination: `${serverUrl}/api/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
