const errors = require('../errors');

module.exports = function (app, options) {

  app.use(function (err, req, res, next) {

    if (err instanceof errors.WorkspaceServerError) {

      switch (err.name) {
        case 'InvalidOption':
          res.status(404).end();
          break;
        case 'NotFound':
          res.status(404).end();
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