#!/bin/bash

# Setup script for internship matching platform
echo "Setting up internship matching platform..."

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies  
cd ../backend
npm install

echo "Setup complete!"