#!/usr/bin/env node
"use strict";

var loadConfig = require("../lib/loadConfig"),
    lint = require("../lib/lint"),
    clearDir = require("../lib/clearDir"),
    rebuildProject = require("../lib/rebuildFiles").rebuildProject,
    KarmaServer = require("../lib/karmaServer"),
    createTestFile = require("../lib/rebuildFiles").createTestFile,
    when = require('when'),
    watchr = require('watchr');

var config = loadConfig();
var server = new KarmaServer(config.karmaOptions);

function getTestFileNameForPath(path) {
    var result = "";
    if (path.length > 8 && path.substr(-8) === ".test.js") {
        result = path;
    }
    else if (path.length > 3 && path.substr(-3) === ".js") {
        var testfile = path.substr(0, path.length - 3) + ".test.js";

        if (require("fs").existsSync(testfile)) {
            result = testfile;
        }
    }

    return result;
}

function runTests(path) {
    var testFile = getTestFileNameForPath(path);
    return lint.lintFile(path, path === testFile, config)
        .then(function(lintSucceeded) {
            if(!lintSucceeded) {
                return false;
            }

            return clearDir(config.karmaPath).then(function() {
                if (!testFile) {
                    console.log("No tests found for '" + path + "'");
                    return false;
                }
                return createTestFile(testFile, config).then(function () {
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
        // paths: [config.srcPath].concat(config.configFiles),
        paths: [config.srcPath],
        listeners: {
            error: function (error) {
                console.error('An error happened in the file update watcher', error);
            },
            change: function (changeType, filePath, fileCurrentStat, filePreviousStat) {
                try {
                    // if (config.isConfigFile(filePath)) {
                    //     var oldConfig = config;
                    //     config = loadConfig();
                    //     if (!deepEqual(oldConfig.karmaOptions, config.karmaOptions)) {
                    //         server.stop();
                    //         server = new KarmaServer(config.karmaOptions);
                    //     }
                    // }
                    if (filePath.length > 3 && filePath.substr(-3) === ".js") {
                        var build = rebuildProject(config);
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
