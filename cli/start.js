// native
const http = require('http');

// third-party
const envOptions = require('@habemus/env-options');

// internal dependencies
const hWorkspaceServer = require('../server');

var options = envOptions({
  port: 'env:PORT',
  apiVersion: 'pkg:version',
  fsRoot: 'env:FS_ROOT',
  host: 'env:HOST',

  supportDir: 'env:SUPPORT_DIR',
  browserifyBundleRegistryURI: 'env:BROWSERIFY_BUNDLE_REGISTRY_URI',

  injectScripts: 'list:INJECT_SCRIPTS',
  hWorkspaceURI: 'env:H_WORKSPACE_URI',
  hWorkspaceToken: 'fs:H_WORKSPACE_TOKEN_PATH',
});

// instantiate the app
var app = hWorkspaceServer(options);

app.ready.then(() => {
  console.log('h-workspace-server setup ready');
})
.catch((err) => {
  console.warn('h-workspace-server setup error', err);
  process.exit(1);
});

// create http server and pass express app as callback
var server = http.createServer(app);

// start listening
server.listen(options.port, function () {
  console.log('h-workspace-server listening at port %s', options.port);
});
