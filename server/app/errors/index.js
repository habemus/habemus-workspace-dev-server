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

function NotFound(identifier) {
  WorkspaceServerError.call(this, 'not found ' + identifier);
}
util.inherits(NotFound, WorkspaceServerError);
NotFound.prototype.name = 'NotFound';

exports.WorkspaceServerError = WorkspaceServerError;
exports.InvalidOption        = InvalidOption;
exports.NotFound             = NotFound;
