#!/bin/bash
# Deployment setup script
# This ensures static files are available where the server expects them

echo "Running production build..."
npm run build

echo "Creating symlink for static files..."
# Remove old symlink/directory if it exists
rm -rf server/public

# Create symlink from server/public to dist/public
ln -s "$(pwd)/dist/public" server/public

echo "Deployment setup complete!"
echo "Static files are available at: server/public -> dist/public"
