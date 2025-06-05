#!/bin/bash

echo "Building Verus Developer Workbench for Linux only (without vLotto)..."

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

# Build electron app for Linux only
echo "Building Electron app for Linux..."
npx electron-builder --linux

echo "Build complete! Check the dist folder for the Linux executables:"
echo "  - AppImage: dist/Verus VDXF Management GUI-*.AppImage"
echo "  - Debian:   dist/verus-vdxf-gui_*_amd64.deb"
echo "  - Archive:  dist/verus-vdxf-gui-*.tar.gz" 