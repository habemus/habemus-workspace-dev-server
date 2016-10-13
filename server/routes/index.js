// third-party
const devServerHTML5 = require('dev-server-html5');

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
    devServerHTML5({
      apiVersion: options.apiVersion,
      htmlInjections: injectScripts.map((scriptSrc) => {
        return '<script src="' + scriptSrc + '"></script>';
      }),
    })
  );

};
