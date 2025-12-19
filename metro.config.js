// // metro.config.js
// const { getDefaultConfig } = require('expo/metro-config'); // or 'metro-config'

// const config = getDefaultConfig(__dirname);

// module.exports = config;


const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
 
const config = getDefaultConfig(__dirname)
 
module.exports = withNativeWind(config, { input: './app/globals.css' })