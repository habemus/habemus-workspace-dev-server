// native
const assert = require('assert');

// third-party
const should = require('should');
const Bluebird = require('bluebird');

const aux = require('../auxiliary');

const createWorkspaceServerApp = require('../../server');

describe('WorkspaceServer initialization', function () {

  it('should properly initialize upon passing the correct options', function () {
    var options = aux.genOptions();

    var app = createWorkspaceServerApp(aux.genOptions());

    var server = aux.createTeardownServer();

    server.on('request', app);

    return new Bluebird((resolve, reject) => {
      server.listen(4000, () => {
        resolve();
      });
    })
    .then(() => {
      return aux.teardown();
    });
  });

  it('should require fsRoot to be passed', function () {
    var options = aux.genOptions();

    delete options.fsRoot;

    assert.throws(function () {
      createWorkspaceServerApp(options);
    });
  });

  it('should require an idParsingStrategy option to be passed', function () {
    var options = aux.genOptions();

    delete options.idParsingStrategy;

    assert.throws(function () {
      createWorkspaceServerApp(options);
    });
  });

  it('should require a valid idParsingStrategy option to be passed', function () {
    var options = aux.genOptions();

    options.idParsingStrategy = 'INVALID_STRATEGY';

    assert.throws(function () {
      createWorkspaceServerApp(options);
    });
  });

  it('should require a host option if the idParsingStrategy is FROM_HOST', function () {
    var options = aux.genOptions();

    options.idParsingStrategy = 'FROM_HOST';
    delete options.host;

    assert.throws(function () {
      createWorkspaceServerApp(options);
    });
  });
});