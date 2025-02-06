/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config: any) => {
    config.resolve.fallback = {
      "fs": false,
      "net": false,
      "tls": false,
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "url": require.resolve("url"),
      "zlib": require.resolve("browserify-zlib"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "assert": require.resolve("assert"),
      "os": require.resolve("os-browserify"),
      "path": require.resolve("path-browserify"),
      "process": require.resolve("process/browser"),
    };
    return config;
  },
  reactStrictMode: true,
}

export default nextConfig;
