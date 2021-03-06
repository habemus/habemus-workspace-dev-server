const devServer = require('habemus-dev-server');
const devServerProcessorCSS = require('habemus-dev-server-processor-css')

module.exports = function (app, options) {

  var injectScripts = options.injectScripts || [];
  injectScripts = Array.isArray(injectScripts) ? injectScripts : injectScripts.split(',');

  // define routing
  app.use(
    '/workspace/:domain',
    app.middleware.parseCode({
      host: options.host,
    }),
    app.middleware.loadWorkspaceFsRoot({
      hWorkspaceToken: options.hWorkspaceToken,

      // set the fsRoot to have the workspaceFsRoot
      // as the fsRoot is the property
      // used by dev-server-html5
      as: 'fsRoot',
    }),
    function (req, res, next) {
      req.domain = req.params.domain;
      next();
    },
    devServer({
      apiVersion: options.apiVersion,
      htmlInjectors: injectScripts.map((scriptSrc) => {
        return '<script src="' + scriptSrc + '"></script>';
      }),
      baseUrl: function (req) {
        return 'http://' + req.domain;
      },
      supportDir: options.supportDir,
      browserifyBundleRegistryURI: options.browserifyBundleRegistryURI,
      processors: {
        'text/css': [
          devServerProcessorCSS,
        ],
      },
    })
  );

};
