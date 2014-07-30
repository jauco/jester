var when = require("when"),
    karma = require("karma"),
    overrideConfig = require("deepmerge");

var defaultConfig = {
    port: 9876,
    colors: true,
    files: [
        {pattern: require.resolve("source-map-support/browser-source-map-support"), watched: false, included: true},
        {pattern: require.resolve("./loadSourcemapsupport"), watched: false, included: true},
        {pattern: '*.js.map', watched: false, included: false, served: true}
    ],
    autoWatch: false,
    captureTimeout: 20000,
    reportSlowerThan: 500,
    plugins: [
      "karma-jasmine",
      "karma-chrome-launcher",
      "karma-firefox-launcher",
      "karma-phantomjs-launcher",
      "karma-ie-launcher"
    ]
};

function withDefaultOptions(options) {
    return overrideConfig(defaultConfig, options);
}

function KarmaServer(options) {
    var self = this;

    self.started = false;
    options = overrideConfig(defaultConfig, options);

    self.start = function() {
        return when.promise(function (resolve, reject) {
            self.started = true;
            karma.server.start(options, function(exitCode) {
                self.started = false;
                console.log("Karma server has finished with " + exitCode);
                resolve(exitCode);
            });
        });
    };

    self.runOnce = function() {
        self.karmaArguments.singleRun = true;
        return self.start();
    };

    var triggerKarma = function () {
        return when.promise(function (resolve, reject) {
            var runner = karma.runner;
            runner.run({port: self.karmaArguments.port}, function (exitCode) {
                resolve(exitCode === 0);
            });
        });
    };

    self.run = function() {
        if(!self.started) {
            self.karmaArguments.singleRun = false;
            return self.start().then(function() { return triggerKarma(); });
        } else {
            return triggerKarma();
        }
    };
}

module.exports = KarmaServer;

module.exports.withDefaultOptions = withDefaultOptions;