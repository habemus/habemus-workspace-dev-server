// native dependencies
const http = require('http');
const fs   = require('fs');

// internal dependencies
const pkg = require('../package.json');

// internal dependencies
const createWorkspaceServer = require('../server');

var MONGODB_URI;

if (process.env.NODE_ENV === 'production') {
  // MONGODB_URI loading strategy is different for production and development environments
  if (!process.env.MONGODB_URI_PATH) {
    throw new Error('MONGODB_URI_PATH is required');
  }
  MONGODB_URI = fs.readFileSync(process.env.MONGODB_URI_PATH, 'utf8');
} else {
  // in development just get it straight from the environment
  MONGODB_URI = process.env.MONGODB_URI;
}

var options = {
  port: process.env.PORT,

  apiVersion: pkg.version,
  fsRoot: process.env.WORKSPACE_FS_ROOT,

  mongodbURI: MONGODB_URI,

  codeParsingStrategy: process.env.CODE_PARSING_STRATEGY,
  host: process.env.HOST,

  injectScripts: process.env.INJECT_SCRIPTS,
};

var app = createWorkspaceServer(options);

// create http server and pass express app as callback
var server = http.createServer(app);

// start listening
server.listen(options.port, function () {
  console.log('h-dev-cloud-workspace-server listening at port %s', options.port);
});