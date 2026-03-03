#!/bin/bash

# Deploy script for internship matching platform
echo "Deploying internship matching platform..."

# Build frontend
cd frontend
npm run build

# Start backend
cd ../backend
npm start