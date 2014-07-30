var lint = require("../lib/lint"),
    clearDir = require("../lib/clearDir"),
    KarmaServer = require("../lib/karmaServer"),
    createTestFile = require("../lib/rebuildFiles").createTestFile,
    glob = require("../lib/globPromise");

module.exports = function runAllTests(config) {
    var sources = config.srcPath + "/**/*.js";

    return glob(sources)
        .then(function (jsFiles) {
            return lint.lintFile(jsFiles);
        })
        .then(function(hasLintSucceeded) {
            return clearDir(config.karmaPath)
                .then(function() {
                    return glob(config.srcPath + "/**/*.test.js");
                })
                .then(function (testInputFiles) {
                    return createTestFile(testInputFiles, config.webPackOptions, config.webpackWarningFilters);
                })
                .catch(function(err) {
                    console.error("failed creating test files ", err);
                })
                .then(function() {
                    var server = new KarmaServer(config.karmaOptions);
                    return server.runOnce().then(function(exitCode) {
                        return exitCode === 0 && hasLintSucceeded;
                    });
                });
        });
};