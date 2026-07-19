import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${process.env.BACKEND_API_URL || "https://mahihi.com/api/v1"}/:path*`, // Proxy Main API
      },
      {
        source: "/storefront/api/v1/:path*",
        destination: `${process.env.STOREFRONT_API_URL || "https://shoppefake-yuky.onrender.com/api/v1"}/:path*`, // Proxy Storefront API
      },
    ];
  },
};

export default nextConfig;
