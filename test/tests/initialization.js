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
});