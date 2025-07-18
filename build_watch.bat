@echo off
echo ========================================
echo    Building Watch Translator APK
echo ========================================

REM Check if EAS CLI is installed
echo Checking EAS CLI...
npx eas --version >nul 2>&1
if errorlevel 1 (
    echo Installing EAS CLI...
    npm install -g @expo/eas-cli
)

REM Login check
echo Checking Expo authentication...
npx eas whoami >nul 2>&1
if errorlevel 1 (
    echo Please login to Expo:
    npx eas login
)

REM Clean previous builds
echo Cleaning previous builds...
if exist dist rmdir /s /q dist
if exist .expo\dist rmdir /s /q .expo\dist

REM Install dependencies
echo Installing dependencies...
npm install

REM Pre-build checks
echo Running pre-build checks...
npx tsc --noEmit
if errorlevel 1 (
    echo TypeScript errors found. Please fix them first.
    pause
    exit /b 1
)

REM Build APK for watch (debug version for testing)
echo Building debug APK for watch...
npx eas build --platform android --profile watch-debug --local

echo.
echo ========================================
echo Build complete! 
echo APK should be in the current directory
echo ========================================
pause