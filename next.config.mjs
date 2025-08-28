/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  experimental: {
    appDir: true, // ✅ force App Router so /app/api routes work
  },
  output: undefined, // ✅ make sure you're NOT doing static export
};

export default nextConfig;
