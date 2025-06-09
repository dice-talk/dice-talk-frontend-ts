// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

// ✅ PNG 파일은 기본 asset으로 처리 (SVG를 제외한 기본 assetExts를 유지하고 html, png 추가)
defaultConfig.resolver.assetExts = defaultConfig.resolver.assetExts.filter(
  (ext) => ext !== "svg"
);
defaultConfig.resolver.assetExts.push('html'); // HTML 추가
defaultConfig.resolver.assetExts.push('png'); // 기존 PNG 설정을 명시적으로 다시 추가 (필터링 후)

// ✅ SVG 파일은 React Component로 처리
defaultConfig.resolver.sourceExts.push("svg");
defaultConfig.transformer.babelTransformerPath = require.resolve(
  "react-native-svg-transformer"
);

module.exports = defaultConfig;
