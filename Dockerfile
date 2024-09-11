# Build stage
FROM node:22.3.0-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Define build arguments
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_CURRENT_DEVELOPMENT_CREDITS_PRICE
ARG NEXT_PUBLIC_CURRENT_PRODUCTION_CREDITS_PRICE
ARG STRIPE_SECRET_KEY
ARG SUPABASE_SERVICE_ROLE_KEY
ARG WEBHOOK_SIGNING_SECRET
ARG NEXT_PUBLIC_SERVER_URL
ARG NEXT_PUBLIC_STRIPE_IS_ENABLED
ARG NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID_LIVE
ARG NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID_TEST
ARG STRIPE_PUBLISHABLE_KEY
ARG STRIPE_PUBLISHABLE_TEST_KEY
ARG AZURE_STORAGE_CONTAINER_NAME

# Create a .env file from build arguments
RUN echo "NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}" >> .env && \
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}" >> .env && \
    echo "NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}" >> .env && \
    echo "NEXT_PUBLIC_CURRENT_DEVELOPMENT_CREDITS_PRICE=${NEXT_PUBLIC_CURRENT_DEVELOPMENT_CREDITS_PRICE}" >> .env && \
    echo "NEXT_PUBLIC_CURRENT_PRODUCTION_CREDITS_PRICE=${NEXT_PUBLIC_CURRENT_PRODUCTION_CREDITS_PRICE}" >> .env && \
    echo "STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}" >> .env && \
    echo "SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}" >> .env && \
    echo "WEBHOOK_SIGNING_SECRET=${WEBHOOK_SIGNING_SECRET}" >> .env && \
    echo "NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL}" >> .env && \
    echo "NEXT_PUBLIC_STRIPE_IS_ENABLED=${NEXT_PUBLIC_STRIPE_IS_ENABLED}" >> .env && \
    echo "NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID_LIVE=${NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID_LIVE}" >> .env && \
    echo "NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID_TEST=${NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID_TEST}" >> .env && \
    echo "STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY}" >> .env && \
    echo "STRIPE_PUBLISHABLE_TEST_KEY=${STRIPE_PUBLISHABLE_TEST_KEY}" >> .env && \
    echo "AZURE_STORAGE_CONTAINER_NAME=${AZURE_STORAGE_CONTAINER_NAME}" >> .env

# Build the Next.js application
RUN npm run build

# Production stage
FROM node:22.3.0-alpine AS runner

WORKDIR /app

# Copy necessary files from builder stage
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.env ./

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV production
ENV PORT 3000

# Start the application
CMD ["node", "server.js"]