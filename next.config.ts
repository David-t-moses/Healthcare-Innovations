import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  exportPathMap: async function () {
    return {
      "/": { page: "/" },
      "/patients": { page: "/patients", dynamic: true },
    };
  },
};

export default nextConfig;
