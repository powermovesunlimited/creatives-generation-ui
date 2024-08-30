# Use the official Node.js image
FROM node:18.20.0

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Set environment variables for Next.js
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Set build arguments
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_ASTRIA_API_URL
ARG NEXT_PUBLIC_CURRENT_DEVELOPMENT_CREDITS_PRICE
ARG NEXT_PUBLIC_CURRENT_PRODUCTION_CREDITS_PRICE
ARG STRIPE_SECRET_KEY
ARG SUPABASE_SERVICE_ROLE_KEY
ARG WEBHOOK_SIGNING_SECRET

# Set environment variables from build arguments
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_ASTRIA_API_URL=$NEXT_PUBLIC_ASTRIA_API_URL
ENV NEXT_PUBLIC_CURRENT_DEVELOPMENT_CREDITS_PRICE=$NEXT_PUBLIC_CURRENT_DEVELOPMENT_CREDITS_PRICE
ENV NEXT_PUBLIC_CURRENT_PRODUCTION_CREDITS_PRICE=$NEXT_PUBLIC_CURRENT_PRODUCTION_CREDITS_PRICE
ENV STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
ENV SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
ENV WEBHOOK_SIGNING_SECRET=$WEBHOOK_SIGNING_SECRET

# Debug: Check Node.js version and npm version
RUN node --version && npm --version

# Create a shell script to run the build command with debugging
RUN echo '#!/bin/sh' > build.sh && \
    echo 'set -x' >> build.sh && \
    echo 'echo "Current working directory: $(pwd)"' >> build.sh && \
    echo 'echo "Content of current directory:"' >> build.sh && \
    echo 'ls -la' >> build.sh && \
    echo 'echo "Node.js version: $(node --version)"' >> build.sh && \
    echo 'echo "npm version: $(npm --version)"' >> build.sh && \
    echo 'echo "next version: $(npx next --version)"' >> build.sh && \
    echo 'echo "Content of next.config.js:"' >> build.sh && \
    echo 'cat next.config.js' >> build.sh && \
    echo 'echo "Environment variables:"' >> build.sh && \
    echo 'env | grep NEXT_PUBLIC' >> build.sh && \
    echo 'echo "Starting build process..."' >> build.sh && \
    echo 'npm run build' >> build.sh && \
    echo 'echo "Build process completed"' >> build.sh && \
    echo 'echo "Content of .next directory:"' >> build.sh && \
    echo 'ls -la .next' >> build.sh && \
    chmod +x build.sh

# Build the Next.js application
RUN ./build.sh

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "node_modules/next/dist/bin/next", "start"]