// native dependencies
const path = require('path');
const http = require('http');

// third-party dependencies
const Bluebird      = require('bluebird');
const enableDestroy = require('server-destroy');
const fse           = require('fs-extra');

// mocks
const mockery       = require('mockery');
const mockPrivateHWorkspace = require('h-workspace-client/mock/private');

const FIXTURES_ROOT_PATH = path.join(__dirname, 'fixtures');
const TMP_ROOT_PATH = path.join(__dirname, 'tmp');

exports.defaultOptions = {
  apiVersion: '0.0.0',
  fsRoot: TMP_ROOT_PATH,
  host: 'http://habemus.io',

  hWorkspaceURI: 'http://localhost:9001',
  hWorkspaceToken: 'some-workspace-token',

  supportDir: '.habemus',
  browserifyBundleRegistryURI: 'https://browserify-bundle-registry.example',
};

/**
 * Enables mockery for h-modules
 */
exports.enableHMocks = function () {
  mockery.enable({
    warnOnReplace: false,
    warnOnUnregistered: false,
    useCleanCache: true
  });

  var hWorkspaceMock = mockPrivateHWorkspace({
    data: {
      workspaces: []
    },
  });

  // mock h-workspace-client/private
  mockery.registerMock(
    'h-workspace-client/private',
    hWorkspaceMock
  );

  return {
    hWorkspaceMock: hWorkspaceMock,
  }
};

/**
 * Generates an options object using
 * the passed options and adding default values to
 * empty options
 * @param  {Object} opts
 * @return {Object}
 */
exports.genOptions = function (opts) {
  return Object.assign({}, exports.defaultOptions, opts);
};

/**
 * Returns a promise that delays the given amount of miliseconds
 * @param  {Number} ms
 * @return {Bluebird}
 */
exports.wait = function (ms) {
  return new Bluebird((resolve) => {
    setTimeout(resolve, ms);
  });
};

/**
 * Used to reject successful promises that should have not been fulfilled
 * @return {Bluebird Rejection}
 */
exports.errorExpected = function () {
  return Bluebird.reject(new Error('error expected'));
};

/**
 * Starts a server and keeps reference to it.
 * This reference will be used for teardown.
 */
exports.createTeardownServer = function () {

  var server = this.server = http.createServer();

  // make the server destroyable
  enableDestroy(server);

  // replace the listen method
  var _listen = server.listen;
  server.listen = function () {

    // register the server to be tore down
    exports.registerTeardown(function () {
      return new Promise((resolve, reject) => {
        server.destroy((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      })
    });

    var args = Array.prototype.slice.call(arguments, 0);
    _listen.apply(server, args);
  };

  return server;
};
/**
 * Sets up an assets object that is ready for the tests
 * @return {[type]} [description]
 */
exports.setup = function () {

  var _assets = {};

  _assets.fixturesRootPath = FIXTURES_ROOT_PATH;

  _assets.tmpRootPath = TMP_ROOT_PATH;

  // empty the tmpRootPath
  fse.emptyDirSync(TMP_ROOT_PATH);

  exports.registerTeardown(function () {
    fse.emptyDirSync(TMP_ROOT_PATH);
  });

  return Bluebird.resolve(_assets);
};

var TEARDOWN_CALLBACKS = [];

/**
 * Register a teardown function to be executed by the teardown
 * The function should return a promise
 */
exports.registerTeardown = function (teardown) {
  TEARDOWN_CALLBACKS.push(teardown);
};

/**
 * Executes all functions listed at TEARDOWN_CALLBACKS
 */
exports.teardown = function () {

  // disable mockery
  mockery.disable();

  return Promise.all(TEARDOWN_CALLBACKS.map((fn) => {
    return fn();
  }))
  .then(() => {
    TEARDOWN_CALLBACKS = [];
  });
};
