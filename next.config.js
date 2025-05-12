/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  // Setting trailingSlash to true prevents unnecessary redirects in Netlify
  trailingSlash: true,
  // Disable image optimization which causes issues with static exports
  images: {
    unoptimized: true,
  },
  // Makes sure errors don't prevent builds from completing
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 4,
  },
};

module.exports = nextConfig;
