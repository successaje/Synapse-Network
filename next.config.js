/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Suppress warnings about multiple Lit versions
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
      };
      
      // Suppress specific warnings
      config.ignoreWarnings = [
        { module: /node_modules\/@lit/ },
        { message: /Multiple versions of Lit loaded/ },
      ];
    }
    
    return config;
  },
}

module.exports = nextConfig

