#!/usr/bin/env node
//
// This example builds a module in both debug and release mode.
// See estrella.d.ts for documentation of available options.
// You can also pass any options for esbuild (as defined in esbuild/lib/main.d.ts).
//
const { build, cliopts } = require("estrella")
const webExt = require("web-ext")

build({
  entry: "src/wildcard.tsx",
  outfile: "dist/wildcard.js",
  bundle: true,
  sourcemap: true,
  define: {
    "process.env.NODE_ENV": '"production"'
  },
  minify: false
})

build({
  entry: "src/wildcard-background.ts",
  outfile: "dist/wildcard-background.js",
  bundle: true,
  sourcemap: true,
  define: {
    "process.env.NODE_ENV": '"production"'
  },
})


build({
  entry: "src/marketplace.js",
  outfile: "dist/marketplace.js",
  bundle: true,
  sourcemap: true,
  define: {
    "process.env.NODE_ENV": '"production"'
  },
})