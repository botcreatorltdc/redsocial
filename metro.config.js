const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Le decimos a Metro que ignore completamente la carpeta del panel web B2B
config.resolver.blockList = [
  /b2b-web\/.*/,
];

module.exports = config;