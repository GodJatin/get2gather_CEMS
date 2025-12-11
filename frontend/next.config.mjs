/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => {
    // Only rewrite to local backend in development
    // In production, Vercel rewrites (in vercel.json) handle this
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: "/api/:path*",
          destination: "http://127.0.0.1:8000/api/:path*",
        },
        {
          source: "/static/:path*",
          destination: "http://127.0.0.1:8000/static/:path*",
        },
      ];
    }
    return [];
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

export default nextConfig;
