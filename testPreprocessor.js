const tsc = require('typescript');
const tsConfig = require('./tsconfig.json');

// delete tsConfig.compilerOptions.moduleResolution
// delete tsConfig.compilerOptions.types
// delete tsConfig.compilerOptions.allowSyntheticDefaultImports

module.exports = {
  process(src, path) {
    if (path.endsWith('.ts') || path.endsWith('.tsx')) {
      return tsc.transpile(src, tsConfig.compilerOptions, path, []);
    }
    return src;
  }
};
