var lintFile = require("../lib/lintFile"),
    clearDir = require("../lib/clearDir"),
    KarmaServer = require("../lib/karmaServer"),
    createTestFile = require("../lib/createTestFile"),
    glob = require("../lib/globPromise");

module.exports = function runAllTests(config) {

    return glob(config.srcPath + "/**/*.js")
        .then(function lintAllFiles(jsFiles) {
            if (jsFiles.length === 0) {
                console.log("No JS files found! My work here is done.");
            }
            else {
                return jsFiles.map(function (file) {
                    return lintFile(file, config.eslintRules);
                }).every(function(r) {
                    return r;
                });
            }
        })
        .then(
            function createTestFiles() {
                return clearDir(config.karmaPath).
                    then(function directoryCleared() {
                        return glob(config.srcPath + "/**/*.test.js");
                    })
                    .then(function packTestFiles(testInputFiles) {
                        return createTestFile(testInputFiles, config.karmaPath);
                    });
            },
            function(err) {
                console.error("failed creating test files ", err);
            }
        )
        .then(function runTests() {
            var server = new KarmaServer(config.karmaPath, config.karmaOptions);
            return server.runOnce().then(function(exitCode) {
                return exitCode;
            });
        });
};