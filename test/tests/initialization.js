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

    return Bluebird.all([
      app.ready,
      new Bluebird((resolve, reject) => {
        server.listen(4000, () => {
          resolve();
        });
      }),
    ])
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

  it('should require an codeParsingStrategy option to be passed', function () {
    var options = aux.genOptions();

    delete options.codeParsingStrategy;

    assert.throws(function () {
      createWorkspaceServerApp(options);
    });
  });

  it('should require a valid codeParsingStrategy option to be passed', function () {
    var options = aux.genOptions();

    options.codeParsingStrategy = 'INVALID_STRATEGY';

    var app = createWorkspaceServerApp(options);

    return app.ready.then(aux.errorExpected)
      .catch((err) => {
        console.log(err);
      });
  });

  it('should require a host option if the codeParsingStrategy is FROM_HOSTNAME', function () {
    var options = aux.genOptions();

    options.codeParsingStrategy = 'FROM_HOSTNAME';
    delete options.host;

    return createWorkspaceServerApp(options)
      .ready
      .then(aux.errorExpected)
      .catch((err) => {
        console.log(err);
      });
  });
});