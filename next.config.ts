import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: { root: import.meta.dirname },
  // Stored photos are read from disk by the authenticated /api/photos route; bundle them for Vercel.
  outputFileTracingIncludes: { '/api/photos/[id]': ['./research/photos/**'] },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
}

export default nextConfig
