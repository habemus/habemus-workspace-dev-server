// native
const url = require('url');

// third-party dependencies
const mongoose = require('mongoose');

// constants
const Schema = mongoose.Schema;

/**
 * Schema that defines a Workspace
 *
 * This is a simplified workspace schema,
 * and only defines properties that will be used by this
 * app.
 * 
 * @type {Schema}
 */
var workspaceSchema = new Schema({

  _id: {
    type: String,
  },

  /**
   * Short human friendly identifier of the workspace
   *
   * ATTENTION: while we have the 1-workspace-to-1-project
   * rule enforced, we'll use the project's code as the workspace's code.
   *
   * BE WARNED:
   * THIS 1-1 parity MUST NOT BE RELIED UPON.
   * 
   * @type {String}
   */
  code: {
    type: String,
    required: true,
    unique: true,
  },
});

// takes the connection and options and returns the model
module.exports = function (conn, app, options) {

  var Workspace = conn.model('Workspace', workspaceSchema);

  return Workspace;
};
