/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { 
      fs: false,
      net: false,
      tls: false,
      dns: false
    };

    // Add resolution for undici
    config.resolve.alias = {
      ...config.resolve.alias,
      'undici': false  // This tells webpack to use Node.js built-in fetch instead
    };

    return config;
  }
};

module.exports = withPWA(nextConfig);