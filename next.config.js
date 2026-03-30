/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports if needed for deployment
  // output: 'export',
  // trailingSlash: true,
  
  // Configure rewrites for root redirections
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/ar/search',
      },
      {
        source: '/en',
        destination: '/en/search',
      },
      {
        source: '/ar',
        destination: '/ar/search',
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/vi/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/vi/**',
      },
    ],
  },
};

module.exports = nextConfig;