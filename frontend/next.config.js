/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/employer-dashboard',
        destination: '/employer/dashboard',
        permanent: true,
      },
      {
        source: '/employer-internships',
        destination: '/employer/internships',
        permanent: true,
      },
      {
        source: '/employer-internships/:path*',
        destination: '/employer/internships/:path*',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig;