/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'misc.vercel.app',
      },
      {
        protocol: 'https',
        hostname: 'assets.vercel.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
      },
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
      },
      {
        protocol: 'https',
        hostname: 'pub-**-**-**-**.r2.dev', // For Supabase storage
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co', // For Supabase storage
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
