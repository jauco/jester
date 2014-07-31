var lint = require("../lib/lint"),
    clearDir = require("../lib/clearDir"),
    KarmaServer = require("../lib/karmaServer"),
    createTestFile = require("../lib/rebuildFiles").createTestFile,
    glob = require("../lib/globPromise"),
    when = require("when");

module.exports = function runAllTests(config) {
    var sources = glob(config.srcPath + "/**/*!(.test).js");
    var testSources = glob(config.srcPath + "/**/*.test.js");

    return when.all(
            testSources.then(function (tests) {
                return lint.lintFile(jsFiles, true, config);
            }),
            sources.then(function (tests) {
                return lint.lintFile(jsFiles, false, config);
            }),
            clearDir(config.karmaPath)
                .then(function() {
                    return testSources;
                })
                .then(function (testInputFiles) {
                    return createTestFile(testInputFiles, config);
                })
                .catch(function(err) {
                    console.error("failed creating test files ", err);
                })
                .then(function() {
                    var server = new KarmaServer(config.karmaOptions);
                    return server.runOnce().then(function (exitCode) {
                        return exitCode === 0;
                    })
                })
        )
        .then(function(results) {
            return results.every(function (isSuccess) { return isSuccess; });
        });
};