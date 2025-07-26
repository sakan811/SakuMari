# Base stage - Use Alpine for smaller size
FROM node:23-alpine AS base
WORKDIR /app

# Install system dependencies (Alpine packages)
RUN apk add --no-cache \
    libc6-compat \
    openssl \
    ca-certificates \
    && npm install -g pnpm@9.1.0

# Dependencies stage - Install production dependencies with caching
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
# Use BuildKit cache mount for pnpm store for faster builds
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --prod --frozen-lockfile

# Build dependencies stage - Install all dependencies for building
FROM base AS build-deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# Build stage with caching
FROM build-deps AS builder
COPY . .

# Generate Prisma client with alternative mirror
ENV PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
RUN pnpm exec prisma generate

# Build with Next.js cache mount for faster rebuilds
RUN --mount=type=cache,id=nextjs,target=/.next/cache \
    pnpm build

# Production stage - Use Alpine for minimal size
FROM node:23-alpine AS runner
WORKDIR /app

# Install runtime dependencies (Alpine packages)
RUN apk add --no-cache \
    libc6-compat \
    openssl \
    ca-certificates \
    && npm install -g pnpm@9.1.0

# Create non-root user for security (Alpine syntax)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy production dependencies and application files
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./next.config.js

# Switch to non-root user for security
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Start the application using Next.js production server
CMD ["pnpm", "start"]