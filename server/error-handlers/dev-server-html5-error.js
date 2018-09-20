// native
const fs   = require('fs');
const path = require('path');

// third-party
const pathToRegExp   = require('path-to-regexp');

const devServer = require('habemus-dev-server');

// templates
const TEMPLATES = {
  fileNotFound: fs.readFileSync(
    path.join(__dirname, '../templates/file-not-found.html'),
    'utf8'
  ),
  indexNotFound: fs.readFileSync(
    path.join(__dirname, '../templates/index-not-found.html'),
    'utf8'
  ),
  rootIndexNotFound: fs.readFileSync(
    path.join(__dirname, '../templates/root-index-not-found.html'),
    'utf8'
  ),
};

// constants
const ROOT_INDEX_HTML_RE = pathToRegExp('/index.html');
const INDEX_HTML_RE      = pathToRegExp('/**/index.html');

module.exports = function (app, options) {

  /**
   * DevServerHTML5 errors only happen at the `/workspace/:domain` route
   */
  app.use('/workspace/:domain', function (err, req, res, next) {

    if (err instanceof devServer.errors.DevServerHTML5Error) {

      switch (err.name) {
        case 'NotFound':
        
          if (ROOT_INDEX_HTML_RE.test(req.path)) {

            res.status(404).send(TEMPLATES.rootIndexNotFound);

          } else if (INDEX_HTML_RE.test(req.path)) {

            res.status(404).send(TEMPLATES.indexNotFound);

          } else {

            res.status(404).send(TEMPLATES.fileNotFound);

          }

          break;
        default:
          next(err);
          break;
      }

    } else {
      next(err);
    }
    
  });
};