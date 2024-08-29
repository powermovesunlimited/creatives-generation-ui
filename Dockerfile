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
    echo 'echo "Starting build process..."' >> build.sh && \
    echo 'npm run build' >> build.sh && \
    echo 'echo "Build process completed"' >> build.sh && \
    echo 'echo "Content of .next directory:"' >> build.sh && \
    echo 'ls -la .next' >> build.sh && \
    chmod +x build.sh

# Build the Next.js application
RUN ./build.sh

# Verify the existence of prerender-manifest.json
RUN test -f /app/.next/prerender-manifest.json || (echo "prerender-manifest.json not found" && exit 1)

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "node_modules/next/dist/bin/next", "start"]