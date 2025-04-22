#!/bin/bash
echo "VERCEL_ENV: $VERCEL_ENV"

if [[ "$VERCEL_ENV" == "production" ]] ; then
  # Proceed with the build
  echo "✅ - Build can proceed"
  npm run build:vercel
else
  # Don't build
  echo "🛑 - Build cancelled"
  exit 0;
fi