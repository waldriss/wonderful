import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/storage/**",
      },
      // Production: add your production API hostname here
    ],
  },
};

export default nextConfig;
