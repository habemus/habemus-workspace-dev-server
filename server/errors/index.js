// native
const util = require('util');

function HWorkspaceServerError(message) {
  Error.call(this, message);
}
util.inherits(HWorkspaceServerError, Error);
HWorkspaceServerError.prototype.name = 'HWorkspaceServerError';

function InvalidOption(option, kind, message) {
  HWorkspaceServerError.call(this, message);
  this.option = option;
  this.kind = kind;
}
util.inherits(InvalidOption, HWorkspaceServerError);
InvalidOption.prototype.name = 'InvalidOption';

function NotFound(identifier) {
  HWorkspaceServerError.call(this, 'not found ' + identifier);
}
util.inherits(NotFound, HWorkspaceServerError);
NotFound.prototype.name = 'NotFound';

exports.HWorkspaceServerError = HWorkspaceServerError;
exports.InvalidOption         = InvalidOption;
exports.NotFound              = NotFound;
