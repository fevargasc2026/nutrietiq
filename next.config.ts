import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
  },
  /* @ts-ignore */
  eslint: {
    ignoreDuringBuilds: true,
  },
  /* @ts-ignore */
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
