import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  allowedDevOrigins: [
    "*.loca.lt",
    "*.trycloudflare.com",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  devIndicators: {
    position: "bottom-right",
  },
  async rewrites() {
    const internalApi =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.INTERNAL_API_URL ||
      process.env.FASTAPI_INTERNAL_URL ||
      "http://127.0.0.1:8000";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${internalApi}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
