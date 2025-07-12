const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['example.com'], // Add your image domains here
  },
  env: {
    SPICY_TESTNET_URL: process.env.SPICY_TESTNET_URL,
    CHILIZ_MAINNET_URL: process.env.CHILIZ_MAINNET_URL,
  },
};

module.exports = nextConfig;