#!/usr/bin/env node
"use strict";
/*eslint no-process-exit: 0*/

require("../lib/addProjectDirToSearchPath");

var loadConfig = require("../lib/loadConfig"),
    lint = require("../lib/lint"),
    clearDir = require("../lib/clearDir"),
    rebuildProject = require("../lib/rebuildProject"),
    KarmaServer = require("../lib/karmaServer"),
    createTestFile = require("../lib/createTestFile"),
    when = require('when'),
    watchr = require('watchr'),
    getTestFileNamesForPath = require("../lib/testFileHelpers").getTestFileNamesForPath;

var config = loadConfig();
var server = new KarmaServer(config.karmaPath, config.karmaOptions);

function runTests(path) {
    return lint.lintFile(path, config.eslintRulesDir)
        .then(function(lintSucceeded) {
            if(!lintSucceeded) {
                return false;
            }

            return clearDir(config.karmaPath)
            .then(function() {
                return getTestFileNamesForPath(path);
            })
            .then(function (testFiles){
                if (!testFiles.length === 0) {
                    console.log("No tests found for '" + path + "'");
                    return false;
                }
                return createTestFile(testFiles, config.srcPath, config.webpackOptions, config.karmaPath, config.webpackAlertFilters).then(function () {
                    return server.run();
                });
            });
        })
        .then(function(hasSucceeded) {
            if(hasSucceeded) {
                console.log("test succeeded for " + path);
            } else {
                console.log("test failed for " + path);
            }
        });
}

function isReallyFileChangeEvent(changeType, fileCurrentStat, filePreviousStat) {
    return changeType === 'create' || (changeType === 'update' && fileCurrentStat.mtime !== filePreviousStat.mtime);
}

function startWatching() {
    watchr.watch({
        paths: [config.srcPath],
        listeners: {
            error: function (error) {
                console.error('An error happened in the file update watcher', error);
            },
            change: function (changeType, filePath, fileCurrentStat, filePreviousStat) {
                try {
                    if (filePath === config.configLocation) {
                        config = loadConfig();
                    }

                    if (filePath.length > 3 && filePath.substr(-3) === ".js") {
                        var build = rebuildProject(config.webpackOptions, config.fullEntryGlob, config.webpackAlertFilters);
                        if (isReallyFileChangeEvent(changeType, fileCurrentStat, filePreviousStat)) {
                            when.join(build, runTests(filePath)).done(function(){});
                        } else {
                            build.done(function(){});
                        }
                    }
                } catch (error) {
                    console.error('An error happened in the file update watcher', error, error.stack);
                }
            }
        },
        persistent: true
    });
}

server.start().done(function(exitCode) {
     process.exit();
});

startWatching();
