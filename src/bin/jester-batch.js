#!/usr/bin/env node
"use strict";

var loadConfig = require("../lib/loadConfig"),
    rebuildProject = require("../lib/rebuildProject"),
    runAllTests = require("../lib/runAllTests"),
    when = require("when"),
    rebuildDocumentation = require("../lib/rebuildDocumentation");

var config = loadConfig("./jester.json");

when.join(
    rebuildProject(config.fullEntryGlob, config.artifactPath),
    //runAllTests(config),
    rebuildDocumentation(config.srcPath, config.apiDocPath, config.jsdocConf, config.readme)
).then(function(exitCodes) {
    
    console.log("ok", exitCodes);
    // first non-zero exit code or 0
    return exitCodes.reduce(function(a,b) { return a | b; }, 0);
}).done(function(exitCode) {
    //karma doesn't seem to end properly. This is a bit of a sledge hammer.
    process.exit(exitCode);
});