import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  webpack: (config, { nextRuntime }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "#crypto":
        nextRuntime === "nodejs"
          ? path.resolve(__dirname, "node_modules/@clerk/backend/dist/runtime/node/crypto.js")
          : path.resolve(__dirname, "node_modules/@clerk/backend/dist/runtime/browser/crypto.js"),
      "@clerk/shared$": path.resolve(__dirname, "node_modules/@clerk/shared/dist/index.js"),
      "@clerk/shared": path.resolve(__dirname, "node_modules/@clerk/shared/dist"),
      "@clerk/backend$": path.resolve(__dirname, "node_modules/@clerk/backend/dist/index.js"),
      "@clerk/backend": path.resolve(__dirname, "node_modules/@clerk/backend/dist"),
      "@supabase/supabase-js": path.resolve(__dirname, "node_modules/@supabase/supabase-js/dist/index.cjs"),
      "@supabase/phoenix$": path.resolve(__dirname, "node_modules/@supabase/phoenix/priv/static/phoenix.cjs.js"),
      "@supabase/phoenix": path.resolve(__dirname, "node_modules/@supabase/phoenix/priv/static/phoenix.cjs.js"),
    };
    return config;
  },
};

export default nextConfig;
