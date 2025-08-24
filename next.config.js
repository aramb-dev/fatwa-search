/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports if needed for deployment
  // output: 'export',
  // trailingSlash: true,
  
  // Configure redirects for external config routes
  async redirects() {
    return [
      {
        source: '/config',
        destination: 'https://app.netlify.com/sites/fatwa-search/overview',
        permanent: false,
      },
      {
        source: '/:lang(en|ar)/config',
        destination: 'https://app.netlify.com/sites/fatwa-search/overview',
        permanent: false,
      },
      {
        source: '/:lang(en|ar)/search/config',
        destination: 'https://app.netlify.com/sites/fatwa-search/overview',
        permanent: false,
      },
      {
        source: '/:lang(en|ar)/yt-search/config',
        destination: 'https://app.netlify.com/sites/fatwa-search/overview',
        permanent: false,
      },
    ];
  },
  
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
};

module.exports = nextConfig;