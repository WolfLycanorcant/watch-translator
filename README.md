# Watch Translator

A high-performance voice translation app optimized for Samsung Watch and Android Wear devices. Translates Tagalog speech to English with advanced offline capabilities and intelligent caching.

## ✨ Features

- 🎤 **Voice Translation**: Real-time Tagalog to English translation
- 📱 **Watch Optimized**: Responsive design for small screens (< 200px)
- 👆 **Advanced Gestures**: Swipe, double-tap, and long-press navigation
- 📚 **Smart Offline Mode**: Intelligent fallback with 70+ common phrases
- 📝 **Translation History**: Persistent storage with search capabilities
- ⚡ **Performance Optimized**: Memory management and bundle optimization
- 🔄 **Multi-Service Fallback**: Google Translate + LibreTranslate APIs
- 🎯 **Accessibility**: Full screen reader and haptic feedback support
- 🧠 **Intelligent Caching**: LRU cache with automatic cleanup
- 🔧 **Error Recovery**: Comprehensive error boundaries and retry logic

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

## 🏗️ Technical Architecture

### Core Technologies
- **Platform**: Android Wear OS / Samsung Watch
- **Framework**: React Native 0.74 with Expo 51
- **Language**: TypeScript with strict type checking
- **State Management**: Custom hooks with optimized re-renders
- **Gestures**: React Native Gesture Handler v2
- **Audio**: Expo AV with optimized recording settings
- **Storage**: AsyncStorage with intelligent caching layer

### Performance Optimizations
- **Bundle Size**: ~20-25MB (optimized from 30MB+)
- **Memory Management**: LRU caching with automatic cleanup
- **Render Optimization**: Memoized components and callbacks
- **Bundle Splitting**: Metro configuration for tree shaking
- **Hermes Engine**: Enabled for faster startup and lower memory
- **Proguard**: Enabled for release builds with resource shrinking

### Offline Capabilities
- **Dictionary**: 70+ common Tagalog phrases with fuzzy matching
- **Caching**: Intelligent translation caching with 24h expiry
- **Fallback Chain**: Local dictionary → Cache → Online APIs
- **Partial Matching**: Word-by-word translation for unknown phrases

## 🛠️ Development

### Quick Start
```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android device/emulator
npm run android
```

### Building
```bash
# Optimized build with full analysis
npm run build

# Release build
npm run build:release

# Simple build (no optimization)
npm run build:simple

# Local build (no cloud)
npm run build:local
```

### Testing & Quality
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Performance Optimization
```bash
# Clean all caches
npm run clean

# Clean build caches only
npm run clean:cache

# Analyze bundle and dependencies
npm run analyze
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