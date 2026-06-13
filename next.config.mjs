/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'digitalhub.fifa.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '1mb'
    }
  }
};

export default nextConfig;
