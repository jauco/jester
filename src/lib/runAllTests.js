var lintFile = require("../lib/lintFile"),
    clearDir = require("../lib/clearDir"),
    launchKarma = require("../lib/launchKarma"),
    createTestFile = require("../lib/createTestFile"),
    glob = require("glob");

module.exports = function runAllTests(config) {
    return glob(config.srcPath + "/**/*.js")
        .then(function lintAllFiles(jsFiles) {
            console.log("linting all files.");
            var filesToGo = jsFiles.length;
            if (jsFiles.length === 0) {
                console.log("No JS files found! My work here is done.");
            } else {
                return when.all(jsFiles.map(function (file) {
                    lintFile(file, config.eslintRules);
                })).then(function (results) {
                    return results.every(function (r) { return r; });
                });
            }
        })
        .then(function createTestFiles() {
            console.log("Creating test files for karma");
            return clearDir(config.karmaPath).then(function directoryCleared() {
                glob(config.srcPath + "/**/*.test.js", function (err, testfiles) {
                    createTestFile(testfiles, config.karmaPath, runTests)
                });
            });
        })
        .then(function runTests() {
            console.log("running the tests.");
            launchKarma(false, config.karmaPath, config.karmaOptions).then(function (exitCode) {
               testsSucceeded = testsSucceeded && exitCode === 0;
               return exitCode | !testsSucceeded;
            });
        });
};