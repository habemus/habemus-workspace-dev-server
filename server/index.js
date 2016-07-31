// native
const path = require('path');

// third-party
const express              = require('express');
const createDevServerHTML5 = require('dev-server-html5');

// own dependencies
const errors = require('./app/errors');

const setupServices = require('./app/services');

module.exports = function (options) {
  if (!options.fsRoot) { throw new Error('fsRoot is required'); }
  if (!options.codeParsingStrategy) { throw new Error('codeParsingStrategy is required'); }
  if (!options.mongodbURI) { throw new Error('mongodbURI is required'); }

  const fsRoot = options.fsRoot;

  var injectScripts = options.injectScripts || [];
  injectScripts = Array.isArray(injectScripts) ? injectScripts : injectScripts.split(',');

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
    app.middleware.parseWorkspaceCode = 
      require('./app/middleware/parse-workspace-code').bind(null, app);
    app.middleware.loadWorkspaceFsRoot =
      require('./app/middleware/load-workspace-fs-root').bind(null, app);

    // define routing
    app.use(
      app.middleware.parseWorkspaceCode({
        as: 'workspaceCode',
        host: options.host,
        strategy: options.codeParsingStrategy
      }),
      app.middleware.loadWorkspaceFsRoot({
        // set the projectRoot to have the workspaceFsRoot
        // as the projectRoot is the property
        // used by dev-server-html5
        // 
        // TODO: change that property to a more neutral one,
        // such as `fsRoot`. Work must be done in dev-server-html5
        as: 'projectRoot',
      }),
      createDevServerHTML5({
        apiVersion: options.apiVersion,
        htmlInjections: injectScripts.map((scriptSrc) => {
          return '<script src="' + scriptSrc + '"></script>';
        }),
      })
    );

    /**
     * Error handling
     */
    require('./app/error-handlers')(app, options);
  });

  return app;
};
