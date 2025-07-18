# Watch Translator APK Build Instructions

## Prerequisites
✅ Expo CLI installed globally
✅ EAS CLI installed globally

## Step-by-Step Build Process

### 1. Login to Expo
```bash
eas login
```
Enter your Expo account credentials. If you don't have an account, create one at https://expo.dev

### 2. Configure the project
The project is already configured with optimized settings for watch deployment.

### 3. Build the APK
Run one of these commands:

**For Debug APK (recommended for testing):**
```bash
eas build --platform android --profile watch-debug
```

**For Release APK:**
```bash
eas build --platform android --profile watch-release
```

### 4. Download the APK
- The build will be submitted to Expo's servers
- You'll get a link to download the APK once it's complete
- Check your Expo dashboard at https://expo.dev for build status

### 5. Install on Watch
1. Download the APK to your computer
2. Transfer it to your watch via ADB or file manager
3. Enable "Install from unknown sources" on your watch
4. Install the APK

## Alternative: Local Build (if you have Android SDK)
```bash
eas build --platform android --profile watch-debug --local
```

## Troubleshooting

### If build fails:
1. Check your internet connection
2. Ensure you're logged into Expo
3. Try the debug profile first
4. Check Expo dashboard for detailed error logs

### Watch-specific settings:
- The app is optimized for small screens (< 250px width)
- Gesture controls are enabled (swipe, double-tap)
- Audio permissions are configured for voice input
- Haptic feedback is optimized for watch hardware

## Features Included in APK:
- ✅ Voice-to-text translation (Tagalog to English)
- ✅ Offline fallback dictionary
- ✅ Translation history with caching
- ✅ Watch-optimized UI
- ✅ Gesture controls
- ✅ Haptic feedback
- ✅ Performance optimizations

## Next Steps After Installation:
1. Grant microphone permissions
2. Test voice recording
3. Check translation accuracy
4. Verify gesture controls work

The APK will be approximately 25-30MB and optimized for watch hardware.