/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // Add a rule to handle .node files for native modules
    config.module.rules.push({
      test: /\.node$/,
      use: "node-loader",
    })

    // Ensure 'fs' and 'path' are not bundled on the client side
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        // Add other Node.js modules if they cause issues
      }
    }

    return config
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "replicate.delivery",
      },
      {
        protocol: "https",
        hostname: "oaidalleapiprodscus.blob.core.windows.net",
      },
    ],
  },
}

export default nextConfig
