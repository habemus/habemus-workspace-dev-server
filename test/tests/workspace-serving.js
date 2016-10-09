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

    var mocks = aux.enableHMocks();

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

        ASSETS.workspace = {
          _id: 'some-workspace-id',
          projectCode: 'my-project',
          projectId: 'some-project-id',
        };

        // emulate the creation of a workspace
        mocks.hWorkspaceMock._addWorkspace(ASSETS.workspace);

        fse.copySync(
          ASSETS.fixturesRootPath + '/mozilla-sample-website',
          ASSETS.tmpRootPath + '/' + ASSETS.workspace._id
        );
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

    var projectCode = ASSETS.workspace.projectCode;
    var workspaceId = ASSETS.workspace._id;
    var file        = 'index.html';

    var testDOMSelector = 'ul li';

    var fileContents = fse.readFileSync(
      ASSETS.tmpRootPath + '/' + workspaceId + '/' + file, 'utf8');

    var $original = cheerio.load(fileContents);

    var domain = projectCode + '.habemus.io';

    return new Bluebird((resolve, reject) => {

      var reqURL = ASSETS.serverURI + '/workspace/' + domain + '/' + file;

      superagent.get(reqURL)
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

  it('should not serve files if no projectCode is found', function () {

    return new Bluebird((resolve, reject) => {
      superagent.get(ASSETS.serverURI + '/workspace/some.other.domain.com/index.html')
        .end((err, res) => {
          if (err) {
            res.statusCode.should.equal(404);

            return resolve();
          }

          reject(new Error('error expected'));
        });
    });
  });

  it('should not serve files if the passed projectCode does not exist', function () {
    return new Bluebird((resolve, reject) => {
      superagent.get(ASSETS.serverURI + '/workspace/fake-workspace.habemus.io/index.html')
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
      superagent.get(ASSETS.serverURI + '/workspace/my-project.habemus.io/file-that-does-not-exist.html')
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

    var projectCode = ASSETS.workspace.projectCode;
    var file        = 'index.html';

    var domain = projectCode + '.habemus.io';

    return new Bluebird((resolve, reject) => {
      superagent.get(ASSETS.serverURI + '/workspace/' + domain + '/' + file)
        .query({
          code: projectCode,
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