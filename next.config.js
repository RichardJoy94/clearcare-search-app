/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        os: false,
        path: false,
        stream: false,
        util: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        'fs/promises': false,
      };
    }

    return config;
  },
  transpilePackages: ['@firebase/auth'],
};

module.exports = withPWA(nextConfig);