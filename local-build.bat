@echo off
echo ========================================
echo    Local APK Build (No Login Required)
echo ========================================

REM Check if we have the Android SDK
echo Checking for Android SDK...
if not exist "%ANDROID_HOME%" (
    echo Android SDK not found. Please install Android Studio first.
    echo Download from: https://developer.android.com/studio
    pause
    exit /b 1
)

REM Install dependencies with minimal setup
echo Installing minimal dependencies...
copy package-simple.json package.json
npm install --legacy-peer-deps

REM Initialize Expo project
echo Initializing Expo project...
npx expo install

REM Build locally
echo Building APK locally...
npx expo run:android --variant release

echo.
echo ========================================
echo Local build complete!
echo APK should be in android/app/build/outputs/apk/
echo ========================================
pause