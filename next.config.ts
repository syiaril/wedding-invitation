/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "phzbfeoxgwqfmulacpzn.supabase.co",
      },
    ],
  },
  // Fix for cross-origin HMR warnings when accessing via local network
  // allowedDevOrigins: ['192.168.1.3', '192.168.0.3'],
  allowedDevOrigins: ['192.168.0.5'],
};

export default nextConfig;
