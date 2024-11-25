/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  // SWCの設定を追加
  compiler: {
    // 必要なトランスフォームを有効化
    emotion: true,
    styledComponents: true,
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default config;