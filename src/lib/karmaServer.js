var when = require("when"),
    karma = require("karma");

function KarmaServer(karmaPath, options) {
    var self = this;

    if (!options) {
        options = {};
    }

    self.karmaArguments = {
        port: 9876,
        basePath: karmaPath,
        frameworks: ["jasmine"].concat(options.frameworks || []),
        files: [
          "*.js"
        ],
        proxies: options.proxies || {},
        preprocessors: options.preprocessors || {},
        reporters: ["dots"],
        colors: true,
        autoWatch: false,
        browsers: options.browsers || [],
        captureTimeout: 20000,
        reportSlowerThan: 500,
        plugins: [
          "karma-jasmine",
          "karma-chrome-launcher",
          "karma-firefox-launcher",
          "karma-phantomjs-launcher",
          "karma-ie-launcher"
        ].concat(options.plugins || [])
    };

    self.started = false;

    self.start = function() {
        return when.promise(function (resolve, reject) {
            self.started = true;
            karma.server.start(self.karmaArguments, function(exitCode) {
                console.log("Karma server has exited with " + exitCode);
                if (exitCode === 0) {
                    self.started = false;
                    resolve(exitCode);
                } else {
                    self.started = false;
                    reject(exitCode);
                }
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
                if (exitCode === 0) {
                    resolve(exitCode);
                } else {
                    reject(exitCode);
                }
            });
        });
    };

    self.run = function() {
        if(!self.started) {
            self.karmaArguments.singleRun = false;
            return self.start().then(function() {

                return triggerKarma();
            });
        } else {
            return triggerKarma();
        }
    };
}

module.exports = KarmaServer;