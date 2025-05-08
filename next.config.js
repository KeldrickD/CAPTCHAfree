/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'captchafree.vercel.app',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.decentralized-content.com',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      }
    ],
  },
};

module.exports = nextConfig; 