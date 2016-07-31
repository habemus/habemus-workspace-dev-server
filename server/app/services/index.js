// third-party
const Bluebird = require('bluebird');

const setupWorkspacesVroot = require('./workspaces-vroot');
const setupMongooseService = require('./mongoose');

module.exports = function (app, options) {
  
  // instantiate services
  app.services = {};
  
  return Bluebird.all([
    setupWorkspacesVroot(app, options),
    setupMongooseService(app, options),
  ])
  .then(() => {
    // ensure nothing is returned by the promise
    return;
  });
};