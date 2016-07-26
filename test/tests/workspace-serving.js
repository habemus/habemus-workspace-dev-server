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
        var app = createWorkspaceServerApp(aux.genOptions());

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

  it('should serve the workspace files', function () {

    var workspaceId = 'mozilla-sample-website';
    var file        = 'index.html';

    var testDOMSelector = 'ul li';

    var fileContents = fse.readFileSync(
      ASSETS.tmpRootPath + '/' + workspaceId + '/' + file, 'utf8');

    var $original = cheerio.load(fileContents);

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

      $modified(testDOMSelector)
        .length.should.equal($original(testDOMSelector).length);

      ($modified(testDOMSelector).length > 0).should.equal(true);
    });

  });

  it('should not serve files if no workspaceId is passed', function () {
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

  it('should not serve files if the passed workspaceId does not exist', function () {
    return new Bluebird((resolve, reject) => {
      superagent.get(ASSETS.serverURI + '/index.html')
        .query({
          workspaceId: 'fake-workspace',
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
});