// third-party dependencies
const rootPathBuilder = require('root-path-builder');

module.exports = function (app, options) {
  const workspacesRoot = rootPathBuilder(options.fsRoot);

  return workspacesRoot;
};
