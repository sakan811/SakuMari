# Build stage
FROM node:25-alpine AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# Install corepack globally since Node.js 25 removed it by default
# Use --force to overwrite existing yarn installation
RUN npm install -g corepack@latest --force && \
    corepack enable

WORKDIR /usr/src/app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client with custom output path, and build application
RUN --mount=type=cache,id=nextjs,target=/.next/cache \
    pnpm exec prisma generate && \
    pnpm build

# Production stage
FROM node:25-alpine AS runner

# Create non-root user for security (Alpine syntax)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /usr/src/app

# Copy standalone application
COPY --from=build --chown=nextjs:nodejs /usr/src/app/.next/standalone ./

# Copy static assets (required for Next.js standalone mode)
COPY --from=build --chown=nextjs:nodejs /usr/src/app/.next/static ./.next/static

# Copy Prisma schema and generated client for database operations
COPY --from=build --chown=nextjs:nodejs /usr/src/app/prisma ./prisma
COPY --from=build --chown=nextjs:nodejs /usr/src/app/generated ./generated

# Switch to non-root user for security
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Start the application using the standalone server
CMD ["node", "server.js"]