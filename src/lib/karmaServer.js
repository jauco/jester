"use strict";
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
            "../polyfills/*.js",
            {pattern: require.resolve("source-map-support/browser-source-map-support"), watched: false, included: true},
            {pattern: require.resolve("./loadSourcemapsupport"), watched: false, included: true},
            {pattern: '*.js.map', watched: false, included: false, served: true},
            "*.js"
        ],
        proxies: options.proxies || {},
        preprocessors: options.preprocessors || {},
        reporters: ["dots", "junit"],
        junitReporter: {
          outputFile: 'test-results.xml',
          suite: ''
        },
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
          "karma-ie-launcher",
          "karma-junit-reporter"
        ].concat(options.plugins || [])
    };

    self.started = false;

    self.start = function() {
        return when.promise(function (resolve, reject) {
            self.started = true;
            karma.server.start(self.karmaArguments, function(exitCode) {
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
