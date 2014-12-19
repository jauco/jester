#!/usr/bin/env node
"use strict";

var loadConfig = require("../lib/loadConfig"),
    lint = require("../lib/lint"),
    clearDir = require("../lib/clearDir"),
    rebuildProject = require("../lib/rebuildProject"),
    KarmaServer = require("../lib/karmaServer"),
    createTestFile = require("../lib/createTestFile"),
    when = require('when'),
    watchr = require('watchr'),
	isTestFile = require("../lib/isTestFile");

var config = loadConfig("./jester.json");
var server = new KarmaServer(config.karmaPath, config.karmaOptions);

function stripExtension(path) {
    if (path.length > 3 && path.substr(-3) === ".js") {
        return path.substr(0, path.length - 3);
    } else if (path.length > 4 && path.substr(-4) === ".jsx") {
        return path.substr(0, path.length - 4);
    } else {
        return false;
    }
}

function getTestFileNameForPath(path) {
    var result = "";
    if (isTestFile(path)) {
        result = path;
    }
    else {
        var base = stripExtension(path);
        if (base) {
            if (require("fs").existsSync(base + "test.js")) {
                result = base + "test.js";
                if (require("fs").existsSync(base + ".test.jsx")) {
                    console.log("WARNING: both " + base + ".test.jsx and " + base + ".test.js exist. Using the .test.js version");
                }
            } else if (require("fs").existsSync(base + ".test.jsx")) {
                result = base + "test.jsx";
            }
        }
    }

    return result;
}

function runTests(path) {
    return lint.lintFile(path, config.eslintRules)
        .then(function(lintSucceeded) {
            if(!lintSucceeded) {
                return false;
            }

            return clearDir(config.karmaPath).then(function() {
                var testFile = getTestFileNameForPath(path);
                if (!testFile) {
                    console.log("No tests found for '" + path + "'");
                    return false;
                }
                return createTestFile(testFile, config.karmaPath, config.webpackWarningFilters).then(function () {
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
                    if (filePath == "jester.json") {
                        config = loadConfig("./jester.json");
                    }

                    if ((filePath.length > 3 && filePath.substr(-3) === ".js") || (filePath.length > 4 && filePath.substr(-4) === ".jsx")) {
                        var build = rebuildProject(config.fullEntryGlob, config.artifactPath, config.webpackWarningFilters);
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
