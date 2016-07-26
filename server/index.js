// native
const path = require('path');

// third-party
const express              = require('express');
const createDevServerHTML5 = require('dev-server-html5');

/**
 * Auxiliary function that joins two paths
 * We do not use path.join because it
 * executes interpretations of relative paths ('..')
 * @param  {String} p1
 * @param  {String} p2
 * @return {String}
 */
const TRAILING_SLASH_RE = /\/$/;
const LEADING_SLASH_RE  = /^\//;
function _joinPaths(p1, p2) {
  return p1.replace(TRAILING_SLASH_RE, '') + '/' + p2.replace(LEADING_SLASH_RE, '');
}

module.exports = function (options) {
  if (!options.fsRoot) { throw new Error('fsRoot is required'); }
  if (!options.idParsingStrategy) { throw new Error('idParsingStrategy is required'); }

  const fsRoot = options.fsRoot;

  var injectScripts = options.injectScripts || [];
  injectScripts = Array.isArray(injectScripts) ? injectScripts : injectScripts.split(',');

  var app = express();

  app.middleware = {};
  app.middleware.parseWorkspaceId = 
    require('./app/middleware/parse-workspace-id').bind(null, app, options);

  app.use(
    app.middleware.parseWorkspaceId({ strategy: options.idParsingStrategy }),
    function setProjectRoot(req, res, next) {
      req.projectRoot = _joinPaths(fsRoot, req.workspaceId);

      next();
    },
    createDevServerHTML5({
      apiVersion: options.apiVersion,
      htmlInjections: injectScripts.map((scriptSrc) => {
        return '<script src="' + scriptSrc + '"></script>';
      }),
    })
  );

  return app;
};
