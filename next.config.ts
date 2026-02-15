import type { NextConfig } from "next";

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lodash", "@/components/*"],
    largePageDataBytes: 128 * 1024,
  },

  serverExternalPackages: ["bcryptjs", "canvas-confetti", "pusher-js"],

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Permissions-Policy",
            value: "identity-credentials-get=*, publickey-credentials-get=*",
          },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type",
          },
          {
            key: "Content-Type",
            value: "application/json",
          },
        ],
      },
      {
        source: "/favicon.ico",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
      {
        source: "/browserconfig.xml",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Content-Type",
            value: "application/xml",
          },
        ],
      },
    ];
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
      {
        protocol: "https",
        hostname: "platform-lookaside.fbsbx.com",
        pathname: "/**",
      },
    ],
    domains: [
      "res.cloudinary.com",
      "lh3.googleusercontent.com",
      "avatars.githubusercontent.com",
      "profile-videos-miel.s3.amazonaws.com",
      "platform-lookaside.fbsbx.com",
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
  assetPrefix: undefined,
  poweredByHeader: false,
};

export default nextConfig;
