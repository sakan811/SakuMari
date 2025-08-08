#!/bin/bash

# SakuMari Database Setup Script
# This script sets up the database locally using Prisma CLI

set -e


SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🚀 SakuMari Database Setup"
echo "=========================="

# Check if .env file exists
if [ ! -f "$PROJECT_ROOT/.env" ]; then
    echo "❌ Error: .env file not found in project root"
    echo "   Please create .env file first with database configuration"
    exit 1
fi

# Create temporary .env.local for database setup
echo "📝 Creating temporary .env.local with localhost database configuration..."
cp "$PROJECT_ROOT/.env" "$PROJECT_ROOT/.env.local"

# Replace POSTGRES_HOST with localhost in .env.local
sed -i.bak 's/POSTGRES_HOST=.*/POSTGRES_HOST=localhost/' "$PROJECT_ROOT/.env.local"
# Replace CREDS_PROVIDER with true
sed -i.bak 's/CREDS_PROVIDER=.*/CREDS_PROVIDER=true/' "$PROJECT_ROOT/.env.local"
rm -f "$PROJECT_ROOT/.env.local.bak"

# Export environment variables from .env.local
export $(grep -v '^#' "$PROJECT_ROOT/.env.local" | xargs)


echo "🔗 Database connection: $POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DB"
echo "🌍 Environment: ${NODE_ENV:-development}"

cd "$PROJECT_ROOT"

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🗄️  Running database migrations..."
npx prisma migrate deploy

echo "🌱 Seeding database with Kana data..."
npx prisma db seed

echo "🧹 Cleaning up temporary files..."
rm -f "$PROJECT_ROOT/.env.local"

echo ""
echo "✅ Database setup completed successfully!"
