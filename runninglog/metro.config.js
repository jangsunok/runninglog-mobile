const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// framer-motion(moti) → tslib ESM/CJS interop 이슈 방지: tslib를 CJS 진입점으로 고정
const projectRoot = __dirname;
const tslibCjsPath = path.resolve(projectRoot, 'node_modules/tslib/tslib.js');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'tslib' || moduleName === 'tslib.js' || moduleName.startsWith('tslib/')) {
    return { type: 'sourceFile', filePath: tslibCjsPath };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
