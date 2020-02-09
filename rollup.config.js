// rollup.config.js
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import typescript from 'rollup-plugin-typescript2';

export default [
{
  input: 'src/wildcard.ts',
  output: {
    file: 'dist/wildcard.js',
    format: 'iife'
  },
  plugins: [
  resolve(),
  commonjs({
        // non-CommonJS modules will be ignored, but you can also
        // specifically include/exclude files
        include: 'node_modules/**',  // Default: undefined
      }),
  postcss({
    extensions: ['.css'],
  }),
  typescript()
  ]
},
];
