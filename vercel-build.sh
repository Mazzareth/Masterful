#!/bin/bash
echo "VERCEL_ENV: $VERCEL_ENV"

if [[ "$VERCEL_ENV" == "production" ]] ; then
  # Proceed with the build
  echo "✅ - Build can proceed"
  npm run build:vercel
  
  # Create a simple routing file for Vercel
  echo "Creating Vercel routing file..."
  echo "/* /index.html 200" > dist/masterwork/browser/_vercel_routes
  
  echo "✅ - Build completed"
else
  # Don't build
  echo "🛑 - Build cancelled"
  exit 0;
fi