/**
 * Project configuration constants
 * Centralized source of truth for all configuration values
 * Used across Makefile, package.json, and environment files
 */

module.exports = {
  // Docker Configuration
  docker: {
    composeFile: 'docker/docker-compose.yml',
    dockerfiles: {
      production: 'Dockerfile',
      test: 'Dockerfile.test'
    }
  },

  // Port Configuration
  ports: {
    app: 3000,
    database: 5432,
    pgadmin: 8080,
    portainer: 9000
  },

  // Database Configuration
  database: {
    name: 'sakumari',
    user: 'postgres',
    password: 'postgres',
    host: {
      local: 'localhost',
      docker: 'db'
    }
  },

  // Application URLs
  urls: {
    localApp: 'http://localhost:3000',
    prismaMirror: 'https://registry.npmmirror.com/-/binary/prisma'
  },

  // File Paths
  paths: {
    testSchema: '__tests__/db/schema.prisma',
    setupScript: './scripts/setup-database.sh'
  },

  // Environment Variables
  env: {
    prismaMirror: 'PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1'
  },

  // Kubernetes Configuration
  kubernetes: {
    namespace: 'sakumari',
    deployments: {
      app: 'sakumari-app',
      database: 'postgres',
      tunnel: 'cloudflare-tunnel'
    },
    services: {
      database: 'postgres-service'
    }
  }
};