module.exports = function (app, options) {

  app.use(function (err, req, res, next) {

    if (err instanceof app.errors.HWorkspaceServerError) {

      switch (err.name) {
        case 'InvalidOption':
          // TODO: study best code for this case.
          // it seems that this should not happen at all,
          // but...
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