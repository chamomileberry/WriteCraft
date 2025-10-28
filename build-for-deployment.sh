#!/bin/bash
set -e

echo "🔨 Building client and server..."
npm run build

echo "🔗 Creating symlink for static files..."
# Remove old symlink/directory if exists
rm -rf server/public

# Create symlink from server/public to dist/public
ln -s "$(pwd)/dist/public" server/public

echo "✅ Build complete!"
echo "   - Client built to: dist/public/"
echo "   - Server built to: dist/index.js"
echo "   - Symlink created: server/public -> dist/public"
ls -la server/public
