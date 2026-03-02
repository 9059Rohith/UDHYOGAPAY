module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './app',
            '@components': './app/components',
            '@screens': './app/screens',
            '@services': './app/services',
            '@hooks': './app/hooks',
            '@utils': './app/utils',
            '@types': './app/types',
            '@store': './app/store',
            '@shared': '../shared'
          }
        }
      ]
    ]
  };
};
