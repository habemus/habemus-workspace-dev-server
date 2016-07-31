// third-party dependencies
const vroot = require('vroot');

module.exports = function (app, options) {

  if (!options.fsRoot) {
    throw new Error('fsRoot is required');
  }

  const workspacesVroot = vroot(options.fsRoot);

  // make it available to the whole application
  app.services.workspacesVroot = workspacesVroot;

  return workspacesVroot;
};
