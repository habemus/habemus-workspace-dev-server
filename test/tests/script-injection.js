// native
const assert = require('assert');

// third-party
const should     = require('should');
const Bluebird   = require('bluebird');
const superagent = require('superagent');
const fse        = require('fs-extra');
const cheerio    = require('cheerio');

const aux = require('../auxiliary');

const createWorkspaceServerApp = require('../../server');

describe('WorkspaceServer workspace serving', function () {
  var ASSETS;

  beforeEach(function () {

    return aux.setup()
      .then((assets) => {
        ASSETS = assets;

        var server = aux.createTeardownServer();

        var options = aux.genOptions();
        options.injectScripts = 'http://test.habemus.com/injected-script.js,http://test2.habemus.com/yet-another-script.js';

        ASSETS.injectScripts = options.injectScripts;

        var app = createWorkspaceServerApp(options);

        server.on('request', app);
        ASSETS.serverURI = 'http://localhost:4000';

        return new Bluebird((resolve, reject) => {
          server.listen(4000, () => {
            resolve();
          });
        });
      })
      .then(() => {
        // move some projects over to the tmpRootPath
        fse.copySync(
          ASSETS.fixturesRootPath + '/mozilla-sample-website',
          ASSETS.tmpRootPath + '/mozilla-sample-website'
        );

        fse.copySync(
          ASSETS.fixturesRootPath + '/html5up-phantom',
          ASSETS.tmpRootPath + '/html5up-phantom'
        );

      });
  });

  afterEach(function () {
    return aux.teardown();
  });

  it('should inject required scripts into the served html file', function () {

    var workspaceId = 'html5up-phantom';
    var file        = 'index.html';

    return new Bluebird((resolve, reject) => {
      superagent.get(ASSETS.serverURI + '/' + file)
        .query({
          workspaceId: workspaceId,
        })
        .end((err, res) => {

          if (err) {
            return reject(err);
          }
          resolve(res.text);
        });
    })
    .then((html) => {

      var $modified = cheerio.load(html);

      var scripts = ASSETS.injectScripts.split(',');

      scripts.forEach((scriptSrc) => {
        $modified('script[src="' + scriptSrc + '"]').length.should.equal(1);
      });
    });

  });
});