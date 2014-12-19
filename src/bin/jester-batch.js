#!/usr/bin/env node
"use strict";

var loadConfig = require("../lib/loadConfig"),
    rebuildDocumentation = require("../lib/rebuildDocumentation"),
    rebuildProject = require("../lib/rebuildProject"),
    runAllTests = require("../lib/runAllTests"),
    when = require("when");

var config = loadConfig("./jester.json");

rebuildProject(config.fullEntryGlob, config.artifactPath, config.webpackWarningFilters)
    .then(function() {
        if(config.srcPath && config.apiDocPath) {
            return rebuildDocumentation(config.srcPath, config.apiDocPath, config.jsdocConf, config.readme);
        } else {
            console.log("please configure srcPath and apiDocPath in order to generate jsdoc documentation")
        }
    })
    .then(function() {
        return runAllTests(config);
    })
    .done(
        function(hasSucceeded) {
            if(!hasSucceeded) {
                console.log("Finished with errors, not all tests or lints succeeded.");
            }
            //karma doesn't seem to end properly. This is a bit of a sledge hammer:
            process.exit(hasSucceeded ? 0 : 1);
        },
        function(err) {
            console.log(err);
            if(err.stack) {
                console.log(err.stack);
            }
            process.exit(1);
        }
    );