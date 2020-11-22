// Runs a socket.io server to update the Chrome extension when files change
// Based on https://github.com/JeromeDane/chrome-extension-auto-reload

var randomWords = require('random-words')

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

  // generate a random build ID which is console-logged by the code at startup.
  // This helps know whether the current built version of the code
  // is actually running in the browser, or whether an extension refresh
  // is needed to get the new version to kick in.
  // (The 'chrome extension autoreload' extension is supposed to take care of this,
  // but it seems to be flaky sometimes)
  const buildId = randomWords(3).join(" ")

  require('esbuild').buildSync({
    entryPoints: ['./src/wildcard.tsx'],
    outfile: './dist/wildcard.js',
    bundle: true,
    define: {
      "process.env.NODE_ENV": '"production"',
      "process.env.__BUILD_ID__": `"${buildId}"`
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

  log('wrote new bundled output to ./dist')
  log(`Build ID: ${buildId}`)

  io.emit('file.change', {});
  log("reloaded chrome extension")
  console.log("")
})
