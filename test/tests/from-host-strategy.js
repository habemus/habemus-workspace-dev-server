/**
 * ATTENTION: This test suite REQUIRES DNS server to be adequately set.
 * You can either set the DNS settings in your /etc/hosts file
 * or use a custom DNS solving strategy, like dnsmasq.
 *
 * We will study improvements to this test suite.
 */

// native
const assert = require('assert');
const url    = require('url');

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

    // require some variables to be set to the environment
    const HOST = process.env.HOST;

    if (!HOST) {
      var message = [
        'HOST envvar MUST be set.',
        'Remember to ensure that the DNS resolves mozilla-sample-website.${HOSTNAME} to this server.',
        'For example, if your HOST is set to `testhost.com` and PORT is 4000,',
        '`mozilla-sample-website.testhost.com:4000` has to be resolved to http://127.0.0.1:4000',
        'and `testhost.com:4000` has to be resolved to http://127.0.0.1:4000 as well',
      ];

      throw new Error(message.join('\n'));
    }

    return aux.setup()
      .then((assets) => {
        ASSETS = assets;

        // make HOST available in the ASSETS object
        ASSETS.host = HOST;

        var server = aux.createTeardownServer();

        var options = aux.genOptions();
        options.idParsingStrategy = 'FROM_HOST';
        options.host = HOST;

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

  it('should parse the workspaceId from the host', function () {

    var parsedHost = url.parse(ASSETS.host);

    var requestURL = 'http://mozilla-sample-website.' + parsedHost.host + '/index.html';

    return new Bluebird((resolve, reject) => {
      superagent.get(requestURL)
        .end((err, res) => {
          if (err) {
            return reject(err);
          }

          resolve(res.text);
        });
    })
    .then((html) => {
      html.should.be.instanceof(String);
    });
  });

  it('should return 404 in case no workspaceId is parsed from the host', function () {
    var parsedHost = url.parse(ASSETS.host);
    var requestURL = 'http://' + parsedHost.host + '/index.html';

    return new Bluebird((resolve, reject) => {
      superagent.get(requestURL)
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