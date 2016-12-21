// native
const path = require('path');

// third-party
const express = require('express');

// own dependencies
const errors = require('./errors');

const setupServices = require('./services');

module.exports = function (options) {
  if (!options.fsRoot) { throw new Error('fsRoot is required'); }
  if (!options.host) { throw new Error('host is required'); }
  if (!options.hWorkspaceURI) { throw new Error('hWorkspaceURI is required'); }
  if (!options.hWorkspaceToken) { throw new Error('hWorkspaceToken is required'); }
  
  /**
   * Options for dev-server-html5
   */
  if (!options.supportDir) { throw new Error('supportDir is required'); }
  if (!options.browserifyBundleRegistryURI) {
    throw new Error('browserifyBundleRegistryURI is required');
  }

  /**
   * The main express router
   * @type {Express Router}
   */
  var app = express();

  /**
   * Let errors available throughout the application
   * @type {Object}
   */
  app.errors = errors;

  /**
   * Setup services
   */
  app.ready = setupServices(app, options).then(() => {
    
    app.middleware = {};
    app.middleware.parseCode = 
      require('./middleware/parse-code').bind(null, app);
    app.middleware.loadWorkspaceFsRoot =
      require('./middleware/load-workspace-fs-root').bind(null, app);
    
    /**
     * Define routes
     */
    require('./routes')(app, options);

    /**
     * Error handling
     */
    require('./error-handlers/h-workspace-server-error')(app, options);
    require('./error-handlers/dev-server-html5-error')(app, options);
    require('./error-handlers/unknown-error')(app, options);
  });

  return app;
};
