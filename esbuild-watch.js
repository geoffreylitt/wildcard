// Runs a socket.io server to update the Chrome extension when files change
// Based on https://github.com/JeromeDane/chrome-extension-auto-reload

var watch = require('watch')
var io = require('socket.io');

console.log("starting build watcher...")
var WEB_SOCKET_PORT = 8890;
io = io.listen(WEB_SOCKET_PORT);

function log(msg) {
  console.log(`${new Date().toISOString()}: ${msg}`)
}

watch.watchTree('./src', (curr, prev) => {
  log("starting rebuild...")

  require('esbuild').buildSync({
    entryPoints: ['./src/wildcard.tsx'],
    outfile: './dist/wildcard.js',
    bundle: true,
    define: {
      "process.env.NODE_ENV": '"production"'
    },
    sourcemap: true
  })

  require('esbuild').buildSync({
    entryPoints: ['./src/wildcard-background.ts'],
    outfile: './dist/wildcard-background.js',
    bundle: true,
    define: {
      "process.env.NODE_ENV": '"production"'
    },
    sourcemap: true
  })
 
  require('esbuild').buildSync({
    entryPoints: ['./src/marketplace.js'],
    outfile: './dist/marketplace.js',
    bundle: true,
    define: {
      "process.env.NODE_ENV": '"production"'
    },
    sourcemap: true
  })

  console.log(`${new Date().toISOString()}: wrote new bundled output to ./dist`)

  io.emit('file.change', {});
  log("reloaded chrome extension")
  console.log("")
})
