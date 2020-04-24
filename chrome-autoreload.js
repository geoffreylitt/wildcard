// Runs a socket.io server to update the Chrome extension when files change
// Based on https://github.com/JeromeDane/chrome-extension-auto-reload

var watch = require('watch')
var io = require('socket.io');

console.log("starting Chrome autoreload server...")
var WEB_SOCKET_PORT = 8890;
io = io.listen(WEB_SOCKET_PORT);
watch.watchTree('./dist', (curr, prev) => {
  console.log("reloading Chrome extension")
  io.emit('file.change', {});
})
