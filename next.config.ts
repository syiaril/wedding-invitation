/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "phzbfeoxgwqfmulacpzn.supabase.co",
      },
    ],
  },
  // Fix for cross-origin HMR warnings when accessing via local network
  // @ts-ignore - this might be a newer or experimental property in some versions
  allowedDevOrigins: ['192.168.1.5'],
};

export default nextConfig;
