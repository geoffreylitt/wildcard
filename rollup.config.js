// rollup.config.js
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import typescript from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';
import builtins from 'rollup-plugin-node-builtins';
import replace from '@rollup/plugin-replace';

import react from 'react';
import reactIs from 'react-is';
import reactDom from 'react-dom';

export default [
{
  input: 'src/wildcard.tsx',
  output: {
    file: 'dist/wildcard.js',
    format: 'iife'
  },
  plugins: [
    resolve(),
    commonjs({
          // non-CommonJS modules will be ignored, but you can also
          // specifically include/exclude files
          include: 'node_modules/**',  // Default: undefined,
          namedExports: {
            react: Object.keys(react),
            'node_modules/react-is/index.js': Object.keys(reactIs),
            'node_modules/react-dom/index.js': Object.keys(reactDom),
          }
        }),
    postcss({
      extensions: ['.css'],
    }),
    typescript({ jsx: "react" }),
    json(),
    replace({
      // todo: change to production?
      'process.env.NODE_ENV': JSON.stringify( 'development' )
    })
  ]
},
{
  input: 'src/wildcard-background.ts',
  output: {
    file: 'dist/wildcard-background.js',
    format: 'iife',
    intro: 'const global = window;'
  },
  plugins: [
    resolve(),
    commonjs({
          // non-CommonJS modules will be ignored, but you can also
          // specifically include/exclude files
          include: 'node_modules/**',  // Default: undefined
        }),
    typescript(),
    json(),
    builtins()
  ]
},
{
  input: 'src/marketplace.js',
  output: {
    file: 'dist/marketplace.js',
    format: 'iife'
  }
}
];
