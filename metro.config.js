const { getDefaultConfig } = require('expo/metro-config');

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

// Optimize bundle splitting
config.serializer.customSerializer = require('@expo/metro-config/build/serializer/withExpoSerializers').createSerializerFromSerialProcessors([
  require('@expo/metro-config/build/serializer/exportHermes'),
]);

// Enable Hermes for better performance
config.transformer.hermesCommand = 'hermes';

module.exports = config;