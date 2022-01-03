import path from 'path'
import alias from '@rollup/plugin-alias'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import strip from '@rollup/plugin-strip'
import { terser } from 'rollup-plugin-terser'
import visualizer from 'rollup-plugin-visualizer'

const release = process.env.APP_MODE === 'release'
const projectRootDir = path.resolve(__dirname)

export default [{
  input: 'build/main.js',
  preserveEntrySignatures: false,
  output: {
    dir: 'www',
    format: 'esm',
    sourcemap: !release,
  },
  plugins: [
    alias({
      entries: [
        {
          // see path mapping in tsconfig.json
          find: /^~/,
          replacement: path.resolve(projectRootDir, 'build')
        }
      ],
    }),
    resolve(),
    commonjs(),
    json(),
    release && strip({
      debugger: true,
      sourceMap: false,
    }),
    release && terser(),
    visualizer(),
  ],
  onwarn(warning, warn) {
    if (warning.code === 'CIRCULAR_DEPENDENCY') return
    if ( warning.code === 'THIS_IS_UNDEFINED' ) return
    warn(warning)
  }
}, {
  input: 'build/socketWorker/index.js',
  output: {
    file: 'www/socketWorker.js',
    format: 'iife',
  },
  plugins: [
    release && strip({
      debugger: true,
      sourceMap: false,
    }),
    release && terser(),
  ]
}]
