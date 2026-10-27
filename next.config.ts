import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build gọn cho Docker: .next/standalone chứa server.js + node_modules tối thiểu
  output: "standalone",
};

export default nextConfig;
