import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import { terser } from 'rollup-plugin-terser'

const production = process.env.APP_MODE === 'prod'

export default {
	input: 'build/main.js',
	output: {
		dir: 'www',
		format: 'esm',
		sourcemap: !production,
	},
	plugins: [
    resolve(),
    commonjs(),
    json(),
		production && terser(),
	],
  onwarn(warning, warn) {
    if (warning.code === 'CIRCULAR_DEPENDENCY') return
    if ( warning.code === 'THIS_IS_UNDEFINED' ) return
    warn(warning)
  }
}
