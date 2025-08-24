/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image configuration for Cloudinary
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  // Webpack configuration for PDF-lib and PDF.js
  webpack: (config, { isServer }) => {
    // Handle canvas module not found error
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    
    // Handle PDF.js worker
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        stream: false,
        crypto: false,
      };
    }
    
    return config;
  },

  // Enable static file serving for PDF.js worker
  async headers() {
    return [
      {
        source: '/pdf.worker.min.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;