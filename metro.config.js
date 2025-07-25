const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Enable tree shaking and minification
config.transformer.minifierConfig = {
  mangle: {
    keep_fnames: true,
  },
  output: {
    ascii_only: true,
    quote_keys: true,
    wrap_iife: true,
  },
  sourceMap: {
    includeSources: false,
  },
  toplevel: false,
  warnings: false,
};

// Optimize bundle splitting and performance
config.serializer.customSerializer = require('@expo/metro-config/build/serializer/withExpoSerializers').createSerializerFromSerialProcessors([
  require('@expo/metro-config/build/serializer/exportHermes'),
]);

// Enable Hermes for better performance
config.transformer.hermesCommand = 'hermes';

// Optimize resolver for faster builds
config.resolver.platforms = ['native', 'android', 'ios', 'web'];
config.resolver.alias = {
  '@': path.resolve(__dirname),
};

// Cache configuration for faster rebuilds
config.cacheStores = [
  {
    name: 'filesystem',
    options: {
      cacheDirectory: path.resolve(__dirname, '.metro-cache'),
    },
  },
];

// Optimize transformer for watch devices
config.transformer.enableBabelRCLookup = false;
config.transformer.enableBabelRuntime = false;

// Watch mode optimizations
config.watchFolders = [
  path.resolve(__dirname, 'node_modules'),
];

// Exclude unnecessary files from bundling
config.resolver.blacklistRE = /node_modules\/.*\/(__tests__|\.test\.|\.spec\.)/;

module.exports = config;