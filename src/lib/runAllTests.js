var lintFile = require("../lib/lintFile"),
    clearDir = require("../lib/clearDir"),
    launchKarma = require("../lib/launchKarma"),
    createTestFile = require("../lib/createTestFile"),
    glob = require("../lib/globPromise");

module.exports = function runAllTests(config) {

    return glob(config.srcPath + "/**/*.js")
        .then(function lintAllFiles(jsFiles) {
            console.log("linting all files.");
            var filesToGo = jsFiles.length;
            if (jsFiles.length === 0) {
                console.log("No JS files found! My work here is done.");
            } 
            else {
                console.log("linting all...");

                return jsFiles.map(function (file) {
                    return lintFile(file, config.eslintRules);
                }).every(function(r) {
                    return r;
                });
            }
        })
        .then(function createTestFiles() {
            console.log("Creating test files for karma");
            return clearDir(config.karmaPath).
                then(function directoryCleared() {
                    console.log("cleared");
                    glob(config.srcPath + "/**/*.test.js").
                    then(function (testfiles) {
                        createTestFile(testfiles, config.karmaPath, runTests)
                    });
                });
        }, function(err) {
            console.log("failed!");
        })
        .then(function runTests() {
            console.log("running the tests.");
            launchKarma(false, config.karmaPath, config.karmaOptions).then(function (exitCode) {
               testsSucceeded = testsSucceeded && exitCode === 0;
               return exitCode | !testsSucceeded;
            });
        });
};