/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "127.0.0.1" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
    // Ensure the bundled Inter TTFs ship with the PDF route in serverless builds.
    outputFileTracingIncludes: {
      "/invoices/[id]/pdf": ["./public/fonts/**"],
    },
  },
};

export default nextConfig;
