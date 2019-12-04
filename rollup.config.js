// rollup.config.js
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

export default [
  {
    input: 'src/datepicker.js',
    output: {
      file: 'dist/datepicker.js',
      format: 'iife'
    },
    plugins: [
      resolve(),
      commonjs({
        // non-CommonJS modules will be ignored, but you can also
        // specifically include/exclude files
        include: 'node_modules/**',  // Default: undefined
      })
    ]
  },
  // add airbnb
];