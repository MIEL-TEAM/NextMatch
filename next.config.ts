import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
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
      {
        protocol: "https",
        hostname: "miel-love.com",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "profile-videos-miel.s3.amazonaws.com",
        pathname: "/**",
      },
    ],
    domains: [
      "res.cloudinary.com",
      "lh3.googleusercontent.com",
      "avatars.githubusercontent.com",
      "profile-videos-miel.s3.amazonaws.com",
    ],
  },
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: "all",
      maxInitialRequests: 5,
      minSize: 20000,
      maxSize: 250000,
    };

    return config;
  },
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
};

export default nextConfig;
