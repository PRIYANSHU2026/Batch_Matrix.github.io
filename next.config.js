/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  // Setting trailingSlash to true prevents unnecessary redirects in Netlify
  trailingSlash: true,
};

module.exports = nextConfig;
