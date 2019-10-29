const tsc = require('typescript');
const tsConfig = require('./tsconfig.json');

tsConfig.compilerOptions.module = 'commonjs'
tsConfig.compilerOptions.target = 'es3'

module.exports = {
  process(src, path) {
    if (path.endsWith('.ts') || path.endsWith('.tsx')) {
      return tsc.transpile(src, tsConfig.compilerOptions, path, []);
    }
    return src;
  }
};
