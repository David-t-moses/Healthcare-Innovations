import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.ignoreWarnings = [
      { module: /node_modules/ },
      { file: /node_modules/ },
    ];
    return config;
  },
};

export default nextConfig;
