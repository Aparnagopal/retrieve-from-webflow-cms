/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  // ✅ Remove experimental.appDir — App Router is always enabled in Next.js 13.4+
  output: undefined, // keep this, ensures server functions are deployed
};

export default nextConfig;
