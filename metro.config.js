// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

// ✅ PNG 파일은 기본 asset으로 처리
defaultConfig.resolver.assetExts = defaultConfig.resolver.assetExts.filter(
  (ext) => ext !== "svg"
);
defaultConfig.resolver.assetExts.push("png");

// ✅ SVG 파일은 React Component로 처리
defaultConfig.resolver.sourceExts.push("svg");
defaultConfig.transformer.babelTransformerPath = require.resolve(
  "react-native-svg-transformer"
);

module.exports = defaultConfig;
