import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: '/.well-known/farcaster.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        // Rewrite para servir el manifest desde la ruta API
        // Mantiene la URL exacta que Farcaster requiere: /.well-known/farcaster.json
        source: '/.well-known/farcaster.json',
        destination: '/.well-known/farcaster',
      },
    ]
  },
  transpilePackages: ['three'],
};

export default nextConfig;
