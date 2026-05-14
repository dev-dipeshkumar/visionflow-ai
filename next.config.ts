import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "preview-chat-db1ea806-c279-4e4a-a744-7f0183d87edc.space-z.ai",
    ".space-z.ai",
    ".space.chatglm.site",
  ],
};

export default nextConfig;
