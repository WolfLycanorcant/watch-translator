import 'react-native-gesture-handler/jestSetup';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock expo modules
jest.mock('expo-av', () => ({
  Audio: {
    Recording: {
      createAsync: jest.fn(() => Promise.resolve({
        recording: {
          stopAndUnloadAsync: jest.fn(),
          getURI: jest.fn(() => 'mock-uri'),
        }
      })),
    },
    RecordingOptionsPresets: {
      HIGH_QUALITY: {},
    },
    AndroidOutputFormat: {
      MPEG_4: 'mpeg4',
    },
    AndroidAudioEncoder: {
      AAC: 'aac',
    },
    IOSOutputFormat: {
      MPEG4AAC: 'mpeg4aac',
    },
    IOSAudioQuality: {
      HIGH: 'high',
    },
  },
}));

jest.mock('expo-speech', () => ({
  speak: jest.fn(),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([['mock translation']]),
    text: () => Promise.resolve('mock translation'),
  })
);

// Mock performance
global.performance = {
  now: jest.fn(() => Date.now()),
};

// Silence console warnings in tests
console.warn = jest.fn();
console.error = jest.fn();
