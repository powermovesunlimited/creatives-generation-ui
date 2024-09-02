/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Ensure the app is built for server-side rendering
  output: 'standalone',
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_CURRENT_DEVELOPMENT_CREDITS_PRICE: process.env.NEXT_PUBLIC_CURRENT_DEVELOPMENT_CREDITS_PRICE,
    NEXT_PUBLIC_CURRENT_PRODUCTION_CREDITS_PRICE: process.env.NEXT_PUBLIC_CURRENT_PRODUCTION_CREDITS_PRICE,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    WEBHOOK_SIGNING_SECRET: process.env.WEBHOOK_SIGNING_SECRET,
    NEXT_PUBLIC_SERVER_URL: process.env.SERVER_URL,
    NEXT_PUBLIC_STRIPE_IS_ENABLED: process.env.NEXT_PUBLIC_STRIPE_IS_ENABLED,
  },
  images: {
    domains: ['creativegenstorage.blob.core.windows.net'],
  },
}

module.exports = nextConfig
