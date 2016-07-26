const errors = require('../errors');

module.exports = function (app, options) {

  app.use(function (err, req, res, next) {

    if (err instanceof errors.WorkspaceServerError) {

      switch (err.name) {
        case 'InvalidOption':

          if (err.option === 'workspaceId') {
            res.status(404).end();
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