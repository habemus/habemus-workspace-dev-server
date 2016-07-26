// native
const util = require('util');

function WorkspaceServerError(message) {
  Error.call(this, message);
}
util.inherits(WorkspaceServerError, Error);
WorkspaceServerError.prototype.name = 'WorkspaceServerError';

function InvalidOption(option, kind, message) {
  WorkspaceServerError.call(this, message);
  this.option = option;
  this.kind = kind;
}
util.inherits(InvalidOption, WorkspaceServerError);
InvalidOption.prototype.name = 'InvalidOption';


exports.WorkspaceServerError = WorkspaceServerError;
