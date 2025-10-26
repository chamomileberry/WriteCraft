#!/bin/bash

# Push Database Schema to Production
# This script temporarily switches to your production database and pushes the schema

echo "🚀 Pushing schema to production database..."
echo ""
echo "⚠️  WARNING: This will modify your production database schema!"
echo "   Make sure you have a backup before proceeding."
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Aborted."
    exit 1
fi

# Check if production URL is provided
if [ -z "$1" ]; then
    echo "❌ Error: Production database URL required"
    echo ""
    echo "Usage: ./scripts/push-schema-to-production.sh 'postgresql://...'"
    echo ""
    echo "Get your production database URL from:"
    echo "  1. Go to your published app"
    echo "  2. Open the Database tool"
    echo "  3. Copy the production connection string"
    exit 1
fi

PROD_URL="$1"

echo "📦 Backing up current DATABASE_URL..."
ORIGINAL_URL="$DATABASE_URL"

echo "🔄 Switching to production database..."
export DATABASE_URL="$PROD_URL"

echo "⚡ Pushing schema to production..."
npm run db:push

echo "✅ Schema pushed successfully!"
echo ""
echo "🔄 Restoring development database URL..."
export DATABASE_URL="$ORIGINAL_URL"

echo ""
echo "✨ Done! Your production database schema is now up to date."
echo "   You can now run the data migration:"
echo "   psql \"$PROD_URL\" -f migration.sql"
