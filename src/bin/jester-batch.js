#!/usr/bin/env node
"use strict";

var loadConfig = require("../lib/loadConfig"),
    rebuildDocumentation = require("../lib/rebuildDocumentation"),
    rebuildProject = require("../lib/rebuildProject"),
    runAllTests = require("../lib/runAllTests"),
    when = require("when");

var config = loadConfig("./jester.json");

rebuildProject(config.fullEntryGlob, config.artifactPath)
    .then(function() {
        return rebuildDocumentation(config.srcPath, config.apiDocPath, config.jsdocConf, config.readme);
    })
    .then(function() {
        return runAllTests(config);
    })
    .done(
        function(exitCode) {
            //karma doesn't seem to end properly. This is a bit of a sledge hammer:
            process.exit(exitCode);
        },
        function(err) {
            console.log(err.stack);
            var errorCode = 1;
            process.exit(errorCode);
        }
    );