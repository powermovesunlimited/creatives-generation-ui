# Build stage
FROM node:22.3.0-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code and the .env.local file
COPY . .

# Build the Next.js application
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_CURRENT_DEVELOPMENT_CREDITS_PRICE=${NEXT_PUBLIC_CURRENT_DEVELOPMENT_CREDITS_PRICE}
ENV NEXT_PUBLIC_CURRENT_PRODUCTION_CREDITS_PRICE=${NEXT_PUBLIC_CURRENT_PRODUCTION_CREDITS_PRICE}
ENV STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
ENV SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
ENV WEBHOOK_SIGNING_SECRET=${WEBHOOK_SIGNING_SECRET}

RUN npm run build

# Production stage
FROM node:22.3.0-alpine AS runner

WORKDIR /app

# Copy necessary files from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.env.local ./

# Echo the contents of the .env.local file
RUN cat .env.local
# Expose the port the app runs on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV production
ENV PORT 3000

# Start the application
CMD ["node", "server.js"]