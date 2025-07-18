module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Reanimated plugin has to be listed last
      'react-native-reanimated/plugin',
      // Performance optimizations
      ['@babel/plugin-transform-runtime', {
        helpers: true,
        regenerator: false,
      }],
      // Remove console.log in production
      process.env.NODE_ENV === 'production' && [
        'transform-remove-console',
        { exclude: ['error', 'warn'] }
      ],
    ].filter(Boolean),
  };
};