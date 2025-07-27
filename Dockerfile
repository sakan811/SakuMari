# Base stage with pnpm setup
FROM node:23-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install system dependencies (Alpine packages)
RUN apk add --no-cache \
    libc6-compat \
    openssl \
    ca-certificates

# Production dependencies stage
FROM base AS prod-deps
WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies + prisma CLI (needed for DB operations)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod && \
    pnpm add prisma@6.12.0

# Build stage with all dependencies
FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app

# Install all dependencies (needed for build process)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Generate Prisma client with alternative mirror
ENV PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
RUN pnpm exec prisma generate

# Build application with Next.js cache mount
RUN --mount=type=cache,id=nextjs,target=/.next/cache \
    pnpm build

# Production stage - Use Alpine for minimal size
FROM node:23-alpine AS runner
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install runtime dependencies (Alpine packages)
RUN apk add --no-cache \
    libc6-compat \
    openssl \
    ca-certificates

# Create non-root user for security (Alpine syntax)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /prod/app

# Copy package files and production-only node_modules
COPY --from=prod-deps --chown=nextjs:nodejs /usr/src/app/package.json ./package.json
COPY --from=prod-deps --chown=nextjs:nodejs /usr/src/app/node_modules ./node_modules

# Ensure node_modules/.bin is in PATH for npx commands
ENV PATH="/prod/app/node_modules/.bin:$PATH"

# Copy built application and Prisma files
COPY --from=build --chown=nextjs:nodejs /usr/src/app/.next ./.next
COPY --from=build --chown=nextjs:nodejs /usr/src/app/prisma ./prisma

# Switch to non-root user for security
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Start the application using pnpm start
CMD ["pnpm", "start"]