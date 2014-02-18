#!/usr/bin/env node
"use strict";

var loadConfig = require("../lib/loadConfig"),
    lintFile = require("../lib/lintFile"),
    clearDir = require("../lib/clearDir"),
    rebuildProject = require("../lib/rebuildProject"),
    launchKarma = require("../lib/launchKarma"),
    createTestFile = require("../lib/createTestFile"),
    watchr = require('watchr');

var config = loadConfig("./jester.json");
var karma = launchKarma(true, config.karmaPath, config.karmaOptions, function () {
    //karma doesn't kill itself properly, or I don't know how to use it. This is a sledge hammer, but it works for now
    process.exit();
});

function runFileTests(path) {
    console.log("Running tests for " + path);
    lintFile(path, config.eslintRules, function onLintReady(lintSucceeded) {
        if (lintSucceeded) {
            clearDir(config.karmaPath, function directoryCleared() {
                var testfile;
                if (path.substr(-8) === ".test.js") {
                    createTestFile(testfile, config.karmaPath, function filesGenerated() {
                        karma.triggerRun();
                    });
                } else {
                    testfile = path.substr(0, path.length - 3) + ".test.js";
                    require("fs").stat(testfile, function (err, stat) {
                        if (stat) {
                            createTestFile(testfile, config.karmaPath, function filesGenerated() {
                                karma.triggerRun();
                            });
                        } else {
                            console.log("No tests found for '" + path + "'");
                        }
                    })
                }
            });
        }
    });
}

watchr.watch({
    paths: [config.srcPath],
    listeners: {
        error: function (error) { console.error('An error happened in the file update watcher', error); },
        change: function (changeType, filePath, fileCurrentStat, filePreviousStat) {
            try {
                if (filePath.substr(-3) === ".js") {
                    config = loadConfig("./jester.json");
                    if (changeType === 'create' || (changeType === 'update' && fileCurrentStat.mtime !== filePreviousStat.mtime)) {
                        runFileTests(filePath);
                    }
                    rebuildProject(config.fullEntryGlob, config.artifactPath);
                }
            } catch (error) {
                console.error('An error happened in the file update watcher', error, error.stack);
            }
        }
    },
    persistent: true
});