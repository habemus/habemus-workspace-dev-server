// native
const path = require('path');

// third-party
const express              = require('express');
const createDevServerHTML5 = require('dev-server-html5');

// own dependencies
const errors = require('./errors');

const setupServices = require('./services');

module.exports = function (options) {
  if (!options.fsRoot) { throw new Error('fsRoot is required'); }
  if (!options.codeParsingStrategy) { throw new Error('codeParsingStrategy is required'); }
  if (!options.hWorkspaceURI) { throw new Error('hWorkspaceURI is required'); }
  if (!options.hWorkspaceToken) { throw new Error('hWorkspaceToken is required'); }

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
    app.middleware.parseCode = 
      require('./middleware/parse-code').bind(null, app);
    app.middleware.loadWorkspaceFsRoot =
      require('./middleware/load-workspace-fs-root').bind(null, app);

    // define routing
    app.use(
      app.middleware.parseCode({
        as: 'workspaceCode',
        host: options.host,
        strategy: options.codeParsingStrategy
      }),
      app.middleware.loadWorkspaceFsRoot({
        hWorkspaceToken: options.hWorkspaceToken,

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
    require('./error-handlers/h-workspace-server-error')(app, options);
  });

  return app;
};
