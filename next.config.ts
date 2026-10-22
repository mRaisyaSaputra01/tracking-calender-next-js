import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  outputFileTracingIncludes: {
    "/*": ["./certs/isrgrootx1.pem"],
  },
};

export default nextConfig;
