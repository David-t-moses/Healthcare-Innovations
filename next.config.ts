import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { dev }) => {
    if (!dev) {
      config.ignoreWarnings = [
        {
          message: /./, // Match all warnings
        },
      ];
    }
    return config;
  },
};

export default nextConfig;
