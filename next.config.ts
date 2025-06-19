// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
// };

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  experimental: {
    serverActions: {
      bodySizeLimit: "250mb",
    },
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [{ key: "X-Content-Type-Options", value: "nosniff" }],
      },
    ];
  },

  poweredByHeader: false,
};

module.exports = nextConfig;
