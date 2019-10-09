import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import { terser } from 'rollup-plugin-terser'

const production = process.env.NODE_ENV === 'production'

export default {
	input: 'build/main.js',
	output: {
		file: 'www/app.js',
		format: 'iife',
		sourcemap: true
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
