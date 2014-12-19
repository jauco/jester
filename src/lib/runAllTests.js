var lint = require("../lib/lint"),
    clearDir = require("../lib/clearDir"),
    KarmaServer = require("../lib/karmaServer"),
    createTestFile = require("../lib/createTestFile"),
    glob = require("../lib/globPromise");

module.exports = function runAllTests(config) {
    var sources = config.srcPath + "/**/*.js";

    return lint.lintGlob(sources, config.eslintRules)
        .then(function(hasLintSucceeded) {

            return clearDir(config.karmaPath)
                .then(function() {
                    return glob(config.srcPath + "/**/*.test.@(js|jsx)");
                })
                .then(function (testInputFiles) {
                    return createTestFile(testInputFiles, config.karmaPath, config.webpackWarningFilters);
                })
                .catch(function(err) {
                    console.error("failed creating test files ", err);
                })
                .then(function() {
                    var server = new KarmaServer(config.karmaPath, config.karmaOptions);
                    return server.runOnce().then(function(exitCode) {
                        return exitCode === 0 && hasLintSucceeded;
                    });
                });
        });
};
