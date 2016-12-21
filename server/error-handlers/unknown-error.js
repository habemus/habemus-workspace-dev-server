// native
const fs   = require('fs');
const path = require('path');

// own
const UNKNOWN_ERROR_TEMPLATE = fs.readFileSync(
  path.join(__dirname, '../templates/unknown-error.html'),
  'utf8'
);

module.exports = function (app, options) {

  /**
   * MUST be the last error handler
   * Will Not check for anything, only serve 'unknown-error.html'
   */
  app.use(function (err, req, res, next) {

    console.warn(err);

    res.status(500).send(UNKNOWN_ERROR_TEMPLATE);
    
  });
};
