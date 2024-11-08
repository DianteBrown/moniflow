console.log('Metro config loaded');

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const config = {};

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
module.exports = mergeConfig(getDefaultConfig(__dirname), config);
