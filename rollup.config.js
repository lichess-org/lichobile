import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import strip from 'rollup-plugin-strip'
import { terser } from 'rollup-plugin-terser'

const release = process.env.APP_MODE === 'release'

export default {
	input: 'build/main.js',
	output: {
		dir: 'www',
		format: 'esm',
		sourcemap: !release,
	},
	plugins: [
    resolve(),
    commonjs(),
    json(),
    release && strip({
      debugger: true,
      sourceMap: false,
    }),
		release && terser(),
	],
  onwarn(warning, warn) {
    if (warning.code === 'CIRCULAR_DEPENDENCY') return
    if ( warning.code === 'THIS_IS_UNDEFINED' ) return
    warn(warning)
  }
}
