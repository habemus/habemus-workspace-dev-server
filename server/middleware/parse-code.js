// native
const url = require('url');

// third-party
const Bluebird = require('bluebird');

const PARSING_STRATEGIES = ['FROM_HOSTNAME', 'FROM_QUERY'];

/**
 * Returns a middleware that parses the code from the subdomain.
 * @param  {Express app} app
 * @param  {Object} options
 * @return {Express middleware Function}
 */
function parseFromHost(app, options) {
  if (!options.host) {
    throw new Error('host is required');
  }
  
  /**
   * Regular expression that matches a subdomain
   * of the passed host.
   * @type {RegExp}
   */
  const ID_REGEXP = new RegExp('(.+)\\.' + url.parse(options.host).hostname + '$');

  return function parseWorkspaceIdFromHost(req, res, next) {
    var match = req.hostname.match(ID_REGEXP);

    if (!match) {

      next(new app.errors.NotFound('code', 'required'));

    } else {
      req.code = match[1];
      next();
    }

  };
}

/**
 * Returns a middleware that parses the code from the subdomain.
 * @param  {Express app} app
 * @param  {Object} options
 * @return {Express middleware Function}
 */
function parseFromQuery(app, options) {
  return function (req, res, next) {

    var code = req.query.code;

    if (!code) {
      next(new app.errors.NotFound('code', 'required'));
    } else {

      req.code = code;
      next();
    }

  }
}

/**
 * Meta middleware generator.
 * Simply passes the arguments to the actual middleware generator.
 * Returns a middleware that parses the code from the subdomain.
 * @param  {Express app} app
 * @param  {Object} options
 * @return {Express middleware Function}
 */
module.exports = function (app, options) {

  var strategy = options.strategy;

  switch (strategy) {
    case 'FROM_HOSTNAME':
      return parseFromHost(app, options);
    case 'FROM_QUERY':
      return parseFromQuery(app, options);
    default: 
      throw new Error('Invalid strategy');
  }

};