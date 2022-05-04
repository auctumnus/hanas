import dts from 'rollup-plugin-dts'

/*
  This is for merging our .d.ts into one big file, removing
  anything that's not reachable by the exports.

  Ideally this removes all internal members, but I've not yet actually
  figured out if dts does that.
 */

export default {
  input: 'dist/types/index.d.ts',
  output: { file: 'dist/backend-shared.d.ts', format: 'es' },
  plugins: [dts()],
}
