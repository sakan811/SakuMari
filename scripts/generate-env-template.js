#!/usr/bin/env node

/**
 * Environment Template Generator
 * 
 * Generates .env.example using values from config/constants.js
 * Ensures consistency across all environment configurations
 */

const { database, ports, urls } = require('../config/constants');

const template = `# PostgreSQL Database Configuration
POSTGRES_DB=${database.name}
POSTGRES_USER=${database.user}
POSTGRES_PASSWORD=${database.password}
POSTGRES_PORT=${ports.database}
POSTGRES_HOST=${database.host.local}

# Database URLs (update with your actual values)
POSTGRES_PRISMA_URL=postgresql://${database.user}:${database.password}@${database.host.local}:${ports.database}/${database.name}
POSTGRES_URL_NON_POOLING=postgresql://${database.user}:${database.password}@${database.host.local}:${ports.database}/${database.name}

# Authentication
AUTH_URL=${urls.localApp}
AUTH_SECRET=your-random-secret-here
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

# Credentials Provider for E2E Testing (optional)
# Set CREDS_PROVIDER=true to enable email/password authentication alongside Google OAuth
# This is primarily intended for E2E testing and development environments
CREDS_PROVIDER=false
CREDS_TEST_EMAIL=test@sakumari.local
CREDS_TEST_PASSWORD=TestPassword123!

PGADMIN_DEFAULT_EMAIL=admin@admin.com
PGADMIN_DEFAULT_PASSWORD=admin

# Cloudflare Tunnel Configuration
CLOUDFLARE_TUNNEL_TOKEN=your-cloudflare-tunnel-token

# Docker Configuration
DOCKER_IMAGE_NAME=sakanbeer88/sakumari
DOCKER_IMAGE_TAG=latest
CONTAINER_NAME_PREFIX=sakumari

NODE_ENV=development`;

// If called as script, output template
if (require.main === module) {
  console.log(template);
} else {
  // If imported as module, export template
  module.exports = template;
}