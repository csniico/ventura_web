import type { NextConfig } from "next";

// Server-only backend URL (no NEXT_PUBLIC_ → never shipped to the browser).
const API_BASE_URL = (process.env.API_BASE_URL ?? "").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    if (!API_BASE_URL) {
      throw new Error("API_BASE_URL is not set — the backend proxy can't be configured.");
    }
    // Browser calls same-origin /api/backend/*; Next proxies to the real backend.
    return [
      {
        source: "/api/backend/:path*",
        destination: `${API_BASE_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
