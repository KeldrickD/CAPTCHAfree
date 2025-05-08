/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  experimental: {
    optimizeFonts: true,
  },
  images: {
    domains: ['captchafree.vercel.app'],
  },
};

module.exports = nextConfig; 