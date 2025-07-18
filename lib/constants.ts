import { Dimensions } from 'react-native';

// Screen dimensions
export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
export const IS_SMALL_SCREEN = SCREEN_WIDTH < 200;
export const IS_WATCH = SCREEN_WIDTH < 250;

// Storage keys
export const STORAGE_KEYS = {
  HISTORY: '@WatchTranslator/history',
  CACHE: '@WatchTranslator/cache',
  SETTINGS: '@WatchTranslator/settings',
} as const;

// API configuration
export const API_CONFIG = {
  TRANSLATION_TIMEOUT: 5000,
  SPEECH_TIMEOUT: 10000,
  MAX_RECORDING_DURATION: 30000,
  CACHE_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// UI constants
export const UI_CONFIG = {
  MAX_HISTORY_ITEMS: 100,
  BATCH_SIZE: 10,
  ANIMATION_DURATION: 200,
  HAPTIC_DELAY: 50,
} as const;

// Colors
export const COLORS = {
  PRIMARY: '#9E7FFF',
  ERROR: '#ef4444',
  SUCCESS: '#22c55e',
  WARNING: '#f59e0b',
  BACKGROUND: '#171717',
  SURFACE: '#2F2F2F',
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SECONDARY: '#A3A3A3',
  TEXT_DISABLED: '#666',
} as const;

// Language codes
export const LANGUAGES = {
  TAGALOG: 'tl-PH',
  ENGLISH: 'en-US',
} as const;