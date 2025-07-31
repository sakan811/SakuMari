# Build stage
FROM node:23-alpine AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install system dependencies (Alpine packages)
RUN apk add --no-cache \
    libc6-compat \
    openssl \
    ca-certificates

WORKDIR /usr/src/app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client with custom output path
ENV PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
RUN pnpm exec prisma generate

# Build application
RUN --mount=type=cache,id=nextjs,target=/.next/cache \
    pnpm build

# Production stage
FROM node:23-alpine AS runner

# Install runtime dependencies (Alpine packages)
RUN apk add --no-cache \
    libc6-compat \
    openssl \
    ca-certificates

# Create non-root user for security (Alpine syntax)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /usr/src/app

# Copy standalone application
COPY --from=build --chown=nextjs:nodejs /usr/src/app/.next/standalone ./

# Copy Prisma schema and generated client for database operations
COPY --from=build --chown=nextjs:nodejs /usr/src/app/prisma ./prisma
COPY --from=build --chown=nextjs:nodejs /usr/src/app/generated ./generated

# Switch to non-root user for security
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Start the application using the standalone server
CMD ["node", "server.js"]