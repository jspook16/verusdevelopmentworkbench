# Verus Developer Workbench Build Instructions

## Building Executables Without vLotto

This application can be built as standalone executables for Windows and Linux, with the vLotto functionality completely excluded from the build.

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Python (for node-gyp, if needed)
- Git

**For cross-platform builds:**
- **Linux → Windows**: Requires Wine (`sudo apt install wine`)
- **Windows → Linux**: Requires WSL or Docker
- **macOS**: Can build for all platforms natively

### Quick Build (Automated)

#### Windows
Run the batch file:
```batch
build-no-vlotto.bat
```

#### Linux/macOS
Run the shell script:
```bash
./build-no-vlotto.sh
```

### Manual Build Steps

1. **Install dependencies:**
   ```bash
   npm install
   cd verusdeveloperworkbench
   npm install
   cd ..
   ```

2. **Build renderer without vLotto:**
   ```bash
   cd verusdeveloperworkbench
   VITE_ENABLE_VLOTTO=false npm run build
   cd ..
   ```

3. **Build executables:**
   ```bash
   # For both Windows and Linux
   npx electron-builder --win --linux
   
   # For Windows only
   npx electron-builder --win
   
   # For Linux only
   npx electron-builder --linux
   ```

### Available Build Scripts

- `npm run build:no-vlotto` - Build with vLotto disabled
- `npm run build:windows` - Build Windows executable without vLotto
- `npm run build:linux` - Build Linux executable without vLotto
- `npm run build:all` - Build both Windows and Linux executables without vLotto

### Output

Built executables will be placed in the `dist/` directory:

**Windows:**
- `dist/Verus VDXF Management GUI Setup X.X.X.exe` (installer)
- `dist/Verus VDXF Management GUI X.X.X.exe` (portable)

**Linux:**
- `dist/Verus VDXF Management GUI-X.X.X.AppImage` (AppImage)
- `dist/verus-vdxf-gui_X.X.X_amd64.deb` (Debian package)
- `dist/verus-vdxf-gui-X.X.X.tar.gz` (tar archive)

### Development with vLotto Disabled

To run the application in development mode without vLotto:

```bash
cd verusdeveloperworkbench
VITE_ENABLE_VLOTTO=false npm run dev
```

### Environment Variables

- `VITE_ENABLE_VLOTTO=false` - Disables vLotto tab and functionality completely
- `VITE_ENABLE_VLOTTO=true` (default) - Enables vLotto functionality

### Build Configuration

The build excludes vLotto by:
1. Setting the environment variable `VITE_ENABLE_VLOTTO=false` during the renderer build
2. Using conditional compilation in `MainAppLayout.jsx` to exclude the vLotto tab
3. Using lazy loading in `VLottoWrapper.jsx` to avoid bundling vLotto components when disabled

### Troubleshooting

1. **Build fails on Windows**: Ensure you have Visual Studio Build Tools installed
2. **Permission errors on Linux**: Make sure the build script is executable (`chmod +x build-no-vlotto.sh`)
3. **Missing dependencies**: Run `npm install` in both root and `verusdeveloperworkbench` directories
4. **Windows build fails on Linux**: Install Wine (`sudo apt install wine`) or build on Windows
5. **"wine is required" error**: Either install Wine or use platform-specific builds only
6. **Large bundle size warnings**: These are normal for Electron apps and don't affect functionality

### Notes

- The built executables are completely self-contained and don't require Node.js to run
- vLotto functionality is completely excluded from the build - no dead code is included
- The application will still work normally for all other features (VerusID, VDXF, Currency, Wallet, Marketplace, Playground) 