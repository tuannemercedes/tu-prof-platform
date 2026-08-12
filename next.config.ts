import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  experimental: {
    serverActions: {
      // PDFs e materiais em HTML colados podem passar do limite padrão de 1MB.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
