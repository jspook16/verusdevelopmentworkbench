#!/bin/bash

echo "Building Verus Developer Workbench without vLotto..."

# Install dependencies if needed
echo "Installing dependencies..."
npm install
cd verusdeveloperworkbench
npm install
cd ..

# Build renderer with vLotto disabled
echo "Building renderer without vLotto..."
cd verusdeveloperworkbench
VITE_ENABLE_VLOTTO=false npm run build
cd ..

# Build electron app for Windows and Linux
echo "Building Electron app for Windows and Linux..."
npx electron-builder --win --linux

echo "Build complete! Check the dist folder for the executables." 