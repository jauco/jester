#!/usr/bin/env node
"use strict";

var loadConfig = require("../lib/loadConfig"),
    lintFile = require("../lib/lintFile"),
    clearDir = require("../lib/clearDir"),
    rebuildProject = require("../lib/rebuildProject"),
    launchKarma = require("../lib/launchKarma"),
    createTestFile = require("../lib/createTestFile"),
    glob = require("glob"),
    when = require("when"),
    rebuildDocumentation = require("../lib/rebuildDocumentation");

var config = loadConfig("./jester.json");

function startTests() {
    var testsSucceeded = true;
    var deferred = when.defer();

    var runTests = function() {
        console.log("running the tests.");
        
        new launchKarma(false, config.karmaPath, config.karmaOptions, function (exitCode) {
           testsSucceeded = testsSucceeded && exitCode === 0;
           deferred.resolve(exitCode | !testsSucceeded);
        });
    }

    var createTestFiles = function () {
        console.log("Creating test files for karma");
        
        clearDir(config.karmaPath, function directoryCleared() {
            glob(config.srcPath + "/**/*.test.js", function (err, testfiles) {
                createTestFile(testfiles, config.karmaPath, runTests)
            });
        });
    }
    
    console.log("linting all files.");
    
    glob(config.srcPath + "/**/*.js", function (err, jsFiles) {
        var filesToGo = jsFiles.length;
        if (jsFiles.length === 0) {
            console.log("No JS files found! My work here is done.");
            deferred.resolve(0);
        }
        else {
            jsFiles.forEach(function (file) {
                lintFile(file, config.eslintRules, function onLintReady(lintSucceeded) {
                    testsSucceeded = testsSucceeded && lintSucceeded;
                    filesToGo -= 1;
                    if (filesToGo === 0) {
                        createTestFiles();
                    }
                });
            });
        }
    });

    return deferred.promise;
}

when.join(
    rebuildProject(config.fullEntryGlob, config.artifactPath),
    startTests(), 
    rebuildDocumentation(config.srcPath, config.apiDocPath, config.jsdocConf, config.readme)
).then(function(exitCodes) {
    // first non-zero exit code or 0
    return exitCodes.reduce(function(a,b) { return a | b; }, 0);
}).then(function(exitCode) {
    //karma doesn't seem to end properly. This is a bit of a sledge hammer.
    process.exit(exitCode);
});

