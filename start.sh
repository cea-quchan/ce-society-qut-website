#!/bin/bash

echo "🚀 Starting Educational Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local file not found. Please copy .env.local.template to .env.local and configure it."
    cp .env.local.template .env.local
    echo "✅ Created .env.local from template"
fi

# Run database migrations
echo "🗄️  Running database migrations..."
npm run db:migrate

# Seed database if needed
echo "🌱 Seeding database..."
npm run db:seed

# Start the development server
echo "🌐 Starting development server..."
npm run dev
