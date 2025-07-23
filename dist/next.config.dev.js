"use strict";

/** @type {import('next').NextConfig} */
var nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    forceSwcTransforms: true
  },
  images: {
    domains: ['localhost', 'example.com', 'your-domain.com', 'images.unsplash.com'],
    formats: ['image/avif', 'image/webp']
  },
  webpack: function webpack(config) {
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource'
    });
    return config;
  }
};
module.exports = nextConfig;