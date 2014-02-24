#!/usr/bin/env node
"use strict";

var loadConfig = require("../lib/loadConfig"),
    lintFile = require("../lib/lintFile"),
    clearDir = require("../lib/clearDir"),
    rebuildProject = require("../lib/rebuildProject"),
    launchKarma = require("../lib/launchKarma"),
    createTestFile = require("../lib/createTestFile"),
    glob = require("glob");

var testsSucceeded = true;
var config = loadConfig("./jester.json");

function startTests() {
    console.log("linting all files");
    glob(config.srcPath + "/**/*.js", function (err, jsFiles) {
        var filesToGo = jsFiles.length;
        if (jsFiles.length === 0) {
            console.log("No JS files found! My work here is done.")
        }
        jsFiles.forEach(function (file) {
            lintFile(file, config.eslintRules, function onLintReady(lintSucceeded) {
                testsSucceeded = testsSucceeded && lintSucceeded;
                filesToGo -= 1;
                if (filesToGo === 0) {
                    createTestFiles();
                }
            });
        })
    });
}

function createTestFiles() {
    console.log("Creating test files for karma");
    clearDir(config.karmaPath, function directoryCleared() {
        glob(config.srcPath + "/**/*.test.js", function (err, testfiles) {
            createTestFile(testfiles, config.karmaPath, runTests)
        });
    });
}

function runTests() {
    console.log("running the tests.");
    new launchKarma(false, config.karmaPath, config.karmaOptions, function (exitCode) {
        testsSucceeded = testsSucceeded && exitCode === 0;
        //karma doesn't seem to end properly. This is a bit of a sledge hammer.
        process.exit(testsSucceeded ? 0 : 1);
    })
}

console.log("Rebuilding the project artifacts.");
rebuildProject(config.fullEntryGlob, config.artifactPath);
startTests();