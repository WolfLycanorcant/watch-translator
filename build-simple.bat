@echo off
echo ========================================
echo    Simple Watch Translator APK Build
echo ========================================

REM Install Expo CLI globally if not present
echo Installing Expo CLI...
npm install -g @expo/cli

REM Install EAS CLI
echo Installing EAS CLI...
npm install -g @expo/eas-cli

REM Login to Expo (you'll need to do this manually)
echo.
echo Please login to your Expo account:
eas login

REM Build APK
echo.
echo Building APK for Android Watch...
eas build --platform android --profile watch-debug

echo.
echo ========================================
echo Build submitted! Check your Expo dashboard
echo for the download link once complete.
echo ========================================
pause