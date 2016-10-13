// native
const fs   = require('fs');
const path = require('path');

// own
const WORKSPACE_NOT_FOUND_TEMPLATE = fs.readFileSync(
  path.join(__dirname, '../templates/workspace-not-found.html'),
  'utf8'
);

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
        case 'WorkspaceNotFound':
          res.status(404).send(WORKSPACE_NOT_FOUND_TEMPLATE);
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