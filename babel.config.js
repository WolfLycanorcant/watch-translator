module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      ['@babel/preset-env', {
        targets: {
          android: '21'
        },
        modules: false,
        useBuiltIns: 'usage',
        corejs: 3
      }]
    ],
    plugins: [
      // Performance optimizations
      ['@babel/plugin-transform-runtime', {
        helpers: true,
        regenerator: false,
        useESModules: true
      }],
      // Remove console.log in production
      process.env.NODE_ENV === 'production' && [
        'transform-remove-console',
        { exclude: ['error', 'warn'] }
      ],
      // Gesture handler plugin
      'react-native-gesture-handler/plugin',
      // Reanimated plugin has to be listed last
      'react-native-reanimated/plugin',
    ].filter(Boolean),
  };
};