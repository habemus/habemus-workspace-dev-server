// third-party
const Bluebird = require('bluebird');

module.exports = function (app, options) {
  
  return Bluebird.all([
    require('./workspaces-root')(app, options),
    require('./h-workspace')(app, options),
  ])
  .then((services) => {
  
    app.services = {
      workspacesRoot: services[0],
      hWorkspace: services[1],
    };

    // ensure nothing is returned by the promise
    return;
  });
};