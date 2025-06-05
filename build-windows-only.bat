@echo off
echo Building Verus Developer Workbench for Windows only (without vLotto)...

REM Install dependencies if needed
echo Installing dependencies...
call npm install
cd verusdeveloperworkbench
call npm install
cd ..

REM Build renderer with vLotto disabled
echo Building renderer without vLotto...
cd verusdeveloperworkbench
set VITE_ENABLE_VLOTTO=false
call npm run build
cd ..

REM Build electron app for Windows only
echo Building Electron app for Windows...
call npx electron-builder --win

echo Build complete! Check the dist folder for the Windows executables:
echo   - Installer: dist/Verus VDXF Management GUI Setup *.exe
echo   - Portable:  dist/Verus VDXF Management GUI *.exe
pause 