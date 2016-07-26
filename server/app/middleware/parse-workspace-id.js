// native
const url = require('url');

// third-party
const Bluebird = require('bluebird');

const PARSING_STRATEGIES = ['FROM_HOST', 'FROM_QUERY', 'FROM_PATH'];

/**
 * Returns a middleware that parses the workspaceId from the subdomain.
 * @param  {Express app} app
 * @param  {Object} appOpts
 * @param  {Object} middlewareOpts
 * @return {Express middleware Function}
 */
function parseFromHost(app, appOpts, middlewareOpts) {
  if (!appOpts.host) {
    throw new Error('host is required');
  }

  /**
   * Regular expression that matches a subdomain
   * of the passed host.
   * @type {RegExp}
   */
  const ID_REGEXP = new RegExp('(.+)\\.' + url.parse(appOpts.host).host + '$');

  return function parseWorkspaceIdFromHost(req, res, next) {
    var match = req.get('host').match(ID_REGEXP);

    if (!match) {

      next(new app.errors.InvalidOption('workspaceId', 'required'));

    } else {
      req.workspaceId = match[1];
      next();
    }

  };
}

/**
 * Returns a middleware that parses the workspaceId from the subdomain.
 * @param  {Express app} app
 * @param  {Object} appOpts
 * @param  {Object} middlewareOpts
 * @return {Express middleware Function}
 */
function parseFromQuery(app, appOpts, middlewareOpts) {
  return function (req, res, next) {

    var workspaceId = req.query.workspaceId;

    if (!workspaceId) {
      next(new app.errors.InvalidOption('workspaceId', 'required'));
    } else {

      req.workspaceId = workspaceId;
      next();
    }

  }
}

/**
 * Meta middleware generator.
 * Simply passes the arguments to the actual middleware generator.
 * Returns a middleware that parses the workspaceId from the subdomain.
 * @param  {Express app} app
 * @param  {Object} appOpts
 * @param  {Object} middlewareOpts
 * @return {Express middleware Function}
 */
module.exports = function (app, appOpts, middlewareOpts) {

  var strategy = middlewareOpts.strategy;

  switch (strategy) {
    case 'FROM_HOST':
      return parseFromHost(app, appOpts, middlewareOpts);
    case 'FROM_QUERY':
      return parseFromQuery(app, appOpts, middlewareOpts);
    default: 
      throw new Error('Invalid strategy');
  }

};