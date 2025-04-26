/** @type {import('next').NextConfig} */
const nextConfig = {
  // For Vercel deployment, we want to use the default Next.js server
  // No need for 'output: export' for Vercel, as they support Next.js natively
  // No need for 'distDir: out' as Vercel will handle the build output
  // No need for trailingSlash setting for Vercel
};

module.exports = nextConfig;
