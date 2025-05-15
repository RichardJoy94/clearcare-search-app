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
      // Add other Node.js modules that need to be polyfilled
      net: false,
      tls: false,
      dns: false,
      'stripe': false
    };
    // Handle ESM modules
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
    };

    // Add support for private class fields
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /\.(js|mjs|jsx|ts|tsx)$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['next/babel'],
          plugins: [
            '@babel/plugin-proposal-private-methods',
            '@babel/plugin-proposal-private-property-in-object',
            '@babel/plugin-proposal-class-properties'
          ]
        }
      }
    });

    return config;
  },
  transpilePackages: ['debug', 'supports-color', 'undici', 'firebase'],
};

module.exports = withPWA(nextConfig); 