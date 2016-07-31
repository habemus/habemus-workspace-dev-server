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

        var options = aux.genOptions({
          injectScripts: 'http://test.habemus.com/injected-script.js,http://test2.habemus.com/yet-another-script.js',
        });

        ASSETS.injectScripts = options.injectScripts;

        var app = createWorkspaceServerApp(options);

        // make the app available in the ASSETS object
        ASSETS.app = app;

        server.on('request', app);
        ASSETS.serverURI = 'http://localhost:4000';
        
        return Bluebird.all([
          app.ready,
          new Bluebird((resolve, reject) => {
            server.listen(4000, () => {
              resolve();
            });
          }),
        ]);
      })
      .then(() => {

        // emulate the creation of a workspace
        ASSETS.workspaceCode = 'my-workspace';
        ASSETS.workspaceId   = '110ec58a-a0f2-4ac4-8393-c866d813b8d1';

        fse.copySync(
          ASSETS.fixturesRootPath + '/mozilla-sample-website',
          ASSETS.tmpRootPath + '/' + ASSETS.workspaceId
        );

        const Workspace = ASSETS.app.services.mongoose.models.Workspace;

        var workspace = new Workspace({
          code: ASSETS.workspaceCode,
          _id: ASSETS.workspaceId,
        });

        return workspace.save();
      })
      .catch((err) => {
        console.warn(err);
        return Bluebird.reject(err);
      });
  });

  afterEach(function () {
    return aux.teardown();
  });

  it('should serve the workspace files', function () {

    var workspaceCode = ASSETS.workspaceCode;
    var workspaceId   = ASSETS.workspaceId;
    var file          = 'index.html';

    var testDOMSelector = 'ul li';

    var fileContents = fse.readFileSync(
      ASSETS.tmpRootPath + '/' + workspaceId + '/' + file, 'utf8');

    var $original = cheerio.load(fileContents);

    return new Bluebird((resolve, reject) => {
      superagent.get(ASSETS.serverURI + '/' + file)
        .query({
          workspaceCode: workspaceCode,
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

      $modified(testDOMSelector)
        .length.should.equal($original(testDOMSelector).length);

      ($modified(testDOMSelector).length > 0).should.equal(true);
    });

  });

  it('should not serve files if no workspaceCode is passed', function () {
    return new Bluebird((resolve, reject) => {
      superagent.get(ASSETS.serverURI + '/index.html')
        .end((err, res) => {
          if (err) {
            res.statusCode.should.equal(404);

            return resolve();
          }

          reject(new Error('error expected'));
        });
    });
  });

  it('should not serve files if the passed workspaceCode does not exist', function () {
    return new Bluebird((resolve, reject) => {
      superagent.get(ASSETS.serverURI + '/index.html')
        .query({
          workspaceCode: 'fake-workspace',
        })
        .end((err, res) => {
          if (err) {
            res.statusCode.should.equal(404);

            return resolve();
          }

          reject(new Error('error expected'));
        });
    });
  });

  it('should return 404 if the requested path does not exit', function () {
    return new Bluebird((resolve, reject) => {
      superagent.get(ASSETS.serverURI + '/file-that-does-not-exist.html')
        .end((err, res) => {
          if (err) {
            res.statusCode.should.equal(404);

            return resolve();
          }

          reject(new Error('error expected'));
        });
    });
  });

  it('should inject required scripts into the served html file', function () {

    var workspaceCode = ASSETS.workspaceCode;
    var file          = 'index.html';

    return new Bluebird((resolve, reject) => {
      superagent.get(ASSETS.serverURI + '/' + file)
        .query({
          workspaceCode: workspaceCode,
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