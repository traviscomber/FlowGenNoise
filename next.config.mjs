/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
      },
      {
        protocol: 'https',
        hostname: 'oaidalleapidev2.blob.core.windows.net',
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
        hostname: 'prod-files-secure.s3.us-west-2.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'v0.dev',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co', // Allow images from Supabase storage
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // For client-side image upscaling, ensure 'canvas' is not bundled on the server
    // This is needed for Replicate's client-side usage if you were to use it directly in the browser.
    // However, for server-side API routes, it's not strictly necessary.
    // If you encounter issues with 'fs' or 'path' in client-side bundles,
    // you might need to add fallbacks.
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        path: false,
        // Add other Node.js modules if they cause issues in the browser bundle
      };
    }
    return config;
  },
};

export default nextConfig;
