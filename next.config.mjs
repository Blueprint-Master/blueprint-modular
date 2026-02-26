/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async redirects() {
    return [];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
    // Limite body pour les Route Handlers (proxy / upload) — défaut 10 Mo, 413 au-delà (ex. import PPTX Monitor)
    proxyClientMaxBodySize: "100mb",
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
