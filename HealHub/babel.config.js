// babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', {
        // Add any specific options if needed
      }]
    ],
    plugins: [
      // Add any plugins if needed
    ]
  };
};