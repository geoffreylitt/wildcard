// rollup.config.js
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import typescript from 'rollup-plugin-typescript2';

export default [
  // {
  //   input: 'src/datepicker.ts',
  //   output: {
  //     file: 'dist/datepicker.js',
  //     format: 'iife'
  //   },
  //   plugins: [
  //     resolve(),
  //     commonjs({
  //       // non-CommonJS modules will be ignored, but you can also
  //       // specifically include/exclude files
  //       include: 'node_modules/**',  // Default: undefined
  //     }),
  //     postcss({
  //       extensions: ['.css'],
  //     }),
  //     typescript()
  //   ]
  // },
  // {
  //   input: 'src/airbnb.ts',
  //   output: {
  //     file: 'dist/airbnb.js',
  //     format: 'iife'
  //   },
  //   plugins: [
  //     resolve(),
  //     commonjs({
  //       // non-CommonJS modules will be ignored, but you can also
  //       // specifically include/exclude files
  //       include: 'node_modules/**',  // Default: undefined
  //     }),
  //     postcss({
  //       extensions: ['.css'],
  //     }),
  //     typescript()
  //   ]
  // },
  {
    input: 'src/todomvc.ts',
    output: {
      file: 'dist/todomvc.js',
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
  // add one rollup output per site for now.
  // in the future, will need to rethink the deployment model.
];