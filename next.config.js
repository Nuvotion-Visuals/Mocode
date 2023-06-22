const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      react: path.resolve('./node_modules/react')
    };

    return config
  },
}

module.exports = nextConfig
