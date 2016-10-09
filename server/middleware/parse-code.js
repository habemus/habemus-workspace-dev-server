// native
const url = require('url');

// third-party
const Bluebird = require('bluebird');

// own
const aux = require('./auxiliary');

// constants
const HTTP_RE = /^https?:\/\//;

/**
 * Returns a middleware that parses the code from the subdomain.
 * @param  {Express app} app
 * @param  {Object} options
 * @return {Express middleware Function}
 */
module.exports = function (app, options) {

  var hostname = HTTP_RE.test(options.host) ?
    url.parse(options.host).hostname : options.host;

  /**
   * Regular expression that matches a subdomain
   * of the passed host.
   * @type {RegExp}
   */
  const CODE_REGEXP = new RegExp('(.+)\\.' + hostname + '$');

  /**
   * Method to retrieve the domain from the request object
   */
  var _domain = options.domain || function (req) {
    return req.params.domain;
  };

  return function parseCode(req, res, next) {

    var domain = aux.evalOpt(_domain, req);
    var match  = domain.match(CODE_REGEXP);

    if (!match) {

      next(new app.errors.NotFound('code', 'required'));

    } else {
      req.code = match[1];
      next();
    }

  };
};
