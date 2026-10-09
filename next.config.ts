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
  allowedDevOrigins: ['192.168.1.9', '192.168.0.9'],
  // allowedDevOrigins: ['192.168.0.9'],
};

export default nextConfig;
