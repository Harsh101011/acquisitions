#!/bin/bash

# Production deployment script for Acquisition App
# This script starts the application in production mode with Neon Cloud Database

echo "🚀 Starting Acquisition App in Production Mode"
echo "==============================================="

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production file not found!"
    echo "   Please create .env.production with your production environment variables."
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo "   Please start Docker and try again."
    exit 1
fi

echo "📦 Building and starting production container..."
echo "   - Using Neon Cloud Database (no local proxy)"
echo "   - Running in optimized production mode"
echo ""

# Start production environment in detached mode
docker compose -f docker-compose.prod.yml up --build -d

echo "⏳ Waiting for container to start..."
sleep 5

# Run migrations with Drizzle (Optional: usually part of CI/CD, but good for local prod testing)
# We run this locally assuming the .env.production has the correct URL
# Alternatively, we could run it inside the container:
# docker compose -f docker-compose.prod.yml exec app npm run db:migrate
echo "📜 Applying latest schema with Drizzle..."
npm run db:migrate

echo ""
echo "🎉 Production environment started!"
echo "   Application: http://localhost:3000"
echo "   Logs: docker compose -f docker-compose.prod.yml logs -f"
echo ""