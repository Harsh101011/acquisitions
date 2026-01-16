#!/bin/bash

# Development startup script for Acquisition App with Neon Local
# This script starts the application in development mode with Neon Local

echo "🚀 Starting Acquisition App in Development Mode"
echo "================================================"

# Check if .env.development exists
if [ ! -f .env.development ]; then
    echo "❌ Error: .env.development file not found!"
    echo "   Please copy .env.development from the template and update with your Neon credentials."
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo "   Please start Docker Desktop and try again."
    exit 1
fi

# Create .neon_local directory if it doesn't exist
mkdir -p .neon_local

# Add .neon_local to .gitignore if not already present
if ! grep -q ".neon_local/" .gitignore 2>/dev/null; then
    echo ".neon_local/" >> .gitignore
    echo "✅ Added .neon_local/ to .gitignore"
fi

echo "📦 Starting Neon Local..."
# Start only the database first
docker compose -f docker-compose.dev.yml up -d neon-local

# Wait for the database to be ready
echo "⏳ Waiting for the database to be ready..."
until docker compose -f docker-compose.dev.yml exec -T neon-local psql -U neon -d neondb -c 'SELECT 1' > /dev/null 2>&1; do
  echo "   Database unavailable - sleeping"
  sleep 1
done
echo "✅ Database is ready!"

# Run migrations with Drizzle
echo "📜 Applying latest schema with Drizzle..."
npm run db:migrate

echo "📦 Starting Application..."
# Start the rest of the environment
docker compose -f docker-compose.dev.yml up --build

echo ""
echo "To stop the environment, press Ctrl+C or run: docker compose down"