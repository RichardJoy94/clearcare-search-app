/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { 
      fs: false,
      net: false,
      tls: false,
      dns: false,
      'stripe': false
    };
    
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
    };

    return config;
  },
  transpilePackages: ['debug', 'supports-color', 'undici', 'firebase'],
};

module.exports = withPWA(nextConfig);