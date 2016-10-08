// third-party dependencies
const PrivateHWorkspaceClient = require('h-workspace-client/private');

module.exports = function (app, options) {
  return new PrivateHWorkspaceClient({
    serverURI: options.hWorkspaceURI
  });
};
