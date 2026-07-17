const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Firebase JS SDK v9+ uses package.json "exports" fields that Metro's
// package-exports resolution (default since Expo SDK 53 / RN 0.79) doesn't
// handle correctly. This causes Firestore/Auth requests to silently fail or
// hang in production builds, even though the network/API itself works fine.
// See: https://github.com/expo/expo/issues/36588
config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
