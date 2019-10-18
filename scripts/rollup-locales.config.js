import { terser } from 'rollup-plugin-terser'

export default {
  output: {
    format: 'esm',
    sourcemap: false,
  },
  plugins: [
    terser(),
  ]
}
