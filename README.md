# Watch Translator

A voice translation app optimized for Samsung Watch and Android Wear devices. Translates Tagalog speech to English with offline fallback support.

## Features

- 🎤 **Voice Translation**: Speak in Tagalog, get English translation
- 📱 **Watch Optimized**: Designed for small screens and touch interfaces
- 👆 **Gesture Controls**: Swipe and double-tap navigation
- 📚 **Offline Support**: Built-in dictionary for common phrases
- 📝 **History**: Save and review past translations
- ⚡ **Performance**: Optimized for watch hardware and battery life

## Quick Start

### Option 1: Download Pre-built APK
1. Go to the [Actions tab](../../actions)
2. Click on the latest "Build APK" workflow
3. Download the APK from the Artifacts section
4. Install on your watch

### Option 2: Build Your Own APK
1. Fork this repository
2. Go to Actions tab in your fork
3. Run the "Build APK (Local Build)" workflow
4. Download the generated APK

## Installation on Samsung Watch

1. **Enable Developer Options**:
   - Go to Settings > About watch
   - Tap "Software version" 7 times
   - Go back to Settings > Developer options
   - Enable "ADB debugging" and "Install via USB"

2. **Install APK**:
   - Transfer APK to watch via ADB or file manager
   - Enable "Install from unknown sources"
   - Install the APK file

3. **Grant Permissions**:
   - Allow microphone access when prompted
   - Test voice recording functionality

## Usage

### Basic Operation
- **Double-tap** to start/stop recording
- **Swipe right** to refresh
- **Swipe left** to clear history
- **Tap record button** for manual control

### Voice Commands
- Speak clearly in Tagalog
- Wait for processing indicator
- Listen to English translation
- View text in history

## Technical Details

- **Platform**: Android Wear OS / Samsung Watch
- **Framework**: React Native with Expo
- **Size**: ~25-30MB
- **Permissions**: Microphone, Internet (optional)
- **Offline**: Works without internet using built-in dictionary

## Development

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Build APK
eas build --platform android --profile watch-debug
```

## Supported Phrases

The app includes offline support for common Tagalog phrases:
- Greetings (kumusta, magandang umaga)
- Basic needs (gutom ako, saan ang banyo)
- Common expressions (salamat, paalam)
- And many more...

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on watch device
5. Submit a pull request

## License

MIT License - feel free to use and modify for your needs.

---

**Ready to translate on your wrist!** 🎤⌚