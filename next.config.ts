import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 0,
    },
    optimizePackageImports: ["lodash", "@/components/*"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "miel-love.com",
        pathname: "/uploads/**",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    config.optimization.splitChunks = {
      chunks: "all",
      maxInitialRequests: 5,
      minSize: 20000,
      maxSize: 250000,
    };

    // Reduce client-side bundle size
    if (!isServer) {
      config.optimization.minimize = true;
    }

    return config;
  },
  // Improve performance and caching
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  compress: true,
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;
