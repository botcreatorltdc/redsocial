const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Le decimos a Metro que ignore completamente la carpeta del panel web B2B
config.resolver.blockList = [
  /b2b-web\/.*/,
];

module.exports = withNativeWind(config, { input: "./global.css" });