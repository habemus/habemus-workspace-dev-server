// third-party
const Bluebird = require('bluebird');

// own dependencies
const aux = require('./auxiliary');

// exports a function that takes the app and some options and
// returns the middleware
module.exports = function (app, options) {

  options = options || {};

  const H_WORKSPACE_TOKEN = options.hWorkspaceToken;

  const errors = app.errors;

  /**
   * The default code loader retrieves the 
   * value directly from the request object.
   * It expects `parse-workspace-code` to have been executed
   * before
   * 
   * @param  {Express Request} req
   * @return {String}
   */
  const _code = options.code || function (req) {
    return req.code;
  }

  /**
   * Property onto which the workspace should be loaded into
   * @type {String}
   */
  const _as = options.as || 'workspaceRoot';

  return function buildWorkspaceFsRoot(req, res, next) {
    var as   = aux.evaluateOpt(_as, req);
    var code = aux.evaluateOpt(_code, req);


    // get the workspace that corresponds to the given code
    app.services.hWorkspace.get(H_WORKSPACE_TOKEN, code, { byProjectCode: true })
      .then((workspace) => {

        var workspaceRoot = app.services.workspacesRoot.prependTo(workspace._id);

        req[as] = workspaceRoot;

        next();
      })
      .catch(next);

    // // fetch the database entry for the workspace requested
    // var workspaceQuery = { code: code };
    // Bluebird.resolve(
    //   app.services.mongoose.models.Workspace.findOne(workspaceQuery)
    // )
    // .then((workspace) => {

    //   if (!workspace) {
    //     return Bluebird.reject(new errors.NotFound(code));
    //   }

    //   var workspaceId = workspace._id;
    //   var workspaceRoot = app.services
    //     .workspacesVroot
    //     .joinAbsolutePath(workspaceId);

    //   req[as] = workspaceRoot;

    //   next();
    // })
    // .catch(next);
  };
};