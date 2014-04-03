var when = require("when");

function Karma() {
}

Karma.prototype.triggerRun = function triggerKarma() {
    return when.promise(function(resolve, reject, notify) {
        var runner = require("karma").runner;
        runner.run({port: 9876}, function(exitCode) {
            console.log("Karma has run with " + exitCode);
            if (exitCode === 0) {
                resolve(exitCode);
            } else {
                reject(exitCode);
            }
        });
    });
};

function launchKarma(persistent, karmaPath, options) {
    return when.promise(function(resolve, reject, notify) {
        if (!options) {
            options = {};
        }
        var karmaArguments = {
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
        
        
        if (persistent) {
            require("karma").server.start(karmaArguments, function (exitCode) {
                console.log("Karma server has exited with " + exitCode);
            });
            resolve(new Karma());
        } else {
            karmaArguments.singleRun = true;
            require("karma").server.start(karmaArguments, function (exitCode) {
                console.log("Karma server has exited with " + exitCode);
                if (exitCode === 0) {
                    resolve(exitCode);
                } else {
                    reject(exitCode);
                }
            });
        }
    });
}

module.exports = launchKarma;