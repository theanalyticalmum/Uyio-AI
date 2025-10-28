/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip static generation for pages with dynamic content
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  async headers() {
    return [
      // Security headers for all routes
      {
        source: '/:path*',
        headers: [
          // HSTS - Force HTTPS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          // Prevent MIME sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // XSS Protection (legacy browsers)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Referrer Policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions Policy (restrict browser features)
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=(), interest-cohort=()',
          },
        ],
      },
      // CORS headers specifically for API routes
      {
        source: '/api/:path*',
        headers: [
          // Allow requests from your own domain only (update after deployment)
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production' 
              ? process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com'
              : 'http://localhost:3000',
          },
          // Allow specific HTTP methods
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          // Allow specific headers
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With',
          },
          // Allow credentials (cookies, auth headers)
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          // Cache preflight requests for 1 hour
          {
            key: 'Access-Control-Max-Age',
            value: '3600',
          },
        ],
      },
    ]
  },
}

export default nextConfig;


