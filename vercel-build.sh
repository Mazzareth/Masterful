#!/bin/bash
echo "VERCEL_ENV: $VERCEL_ENV"

if [[ "$VERCEL_ENV" == "production" ]] ; then
  # Proceed with the build
  echo "✅ - Build can proceed"
  npm run build:vercel
  
  # Copy server configuration files to the build output
  echo "Copying server configuration files..."
  cp -f public/.htaccess dist/masterwork/browser/.htaccess
  cp -f public/web.config dist/masterwork/browser/web.config
  cp -f public/_redirects dist/masterwork/browser/_redirects
  
  # Create a simple routing file for Vercel
  echo "Creating Vercel routing file..."
  echo "/* /index.html 200" > dist/masterwork/browser/_vercel_routes
  
  echo "✅ - Build completed"
else
  # Don't build
  echo "🛑 - Build cancelled"
  exit 0;
fi