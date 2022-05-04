import esbuild from 'rollup-plugin-esbuild'
import fileSize from 'rollup-plugin-filesize'
import { terser } from 'rollup-plugin-terser'

export default ['cjs', 'esm', 'umd'].map((format) => ({
  input: 'src/index.ts',
  output: {
    name: 'hanas',
    file: `dist/backend-shared.${format}.js`,
    // It would be cute if rollup recognized "esm" as esm, but the docs
    // don't seem to indicate that this is the case.
    format: format === 'esm' ? 'es' : format,
  },
  plugins: [esbuild({ minify: true }), terser(), fileSize()],
}))
