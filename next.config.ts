import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // sodium-native is a native addon that can't be bundled by webpack.
      // Mark it external so Node.js loads it at runtime instead.
      // The Stellar SDK will fall back to a pure-JS tweetnacl implementation.
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        "sodium-native",
      ];
    } else {
      // Browser bundle — polyfill or ignore Node-only modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        "sodium-native": false,
      };
    }
    return config;
  },
};

export default nextConfig;
