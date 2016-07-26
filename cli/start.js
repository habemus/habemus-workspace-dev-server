// native dependencies
const http = require('http');

// internal dependencies
const pkg = require('../package.json');

// internal dependencies
const createWorkspaceServer = require('../server');

var options = {
  port: process.env.PORT,
  apiVersion: pkg.version,
  workspaceFsRoot: process.env.WORKSPACE_FS_ROOT,
  host: process.env.HOST,

  injectScripts: [
    'http://some-host.com/somescript.js',
    'http://another-host.com/another.js',
  ]
};

var app = createWorkspaceServer(options);

// create http server and pass express app as callback
var server = http.createServer(app);

// start listening
server.listen(options.port, function () {
  console.log('h-dev-cloud-workspace-server listening at port %s', options.port);
});