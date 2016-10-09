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

      // set the projectRoot to have the workspaceFsRoot
      // as the projectRoot is the property
      // used by dev-server-html5
      // 
      // TODO: change that property to a more neutral one,
      // such as `fsRoot`. Work must be done in dev-server-html5
      as: 'projectRoot',
    }),
    devServerHTML5({
      apiVersion: options.apiVersion,
      htmlInjections: injectScripts.map((scriptSrc) => {
        return '<script src="' + scriptSrc + '"></script>';
      }),
    })
  );

};
