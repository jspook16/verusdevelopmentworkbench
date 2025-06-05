@echo off
echo Building Verus Developer Workbench without vLotto...

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

REM Build electron app for Windows and Linux
echo Building Electron app for Windows and Linux...
call npx electron-builder --win --linux

echo Build complete! Check the dist folder for the executables.
pause 