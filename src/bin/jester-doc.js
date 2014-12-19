#!/usr/bin/env node
"use strict";

var loadConfig = require("../lib/loadConfig"),
    rebuildDocumentation = require("../lib/rebuildDocumentation");

var config = loadConfig("./jester.json");

rebuildDocumentation(config.srcPath, config.apiDocPath, config.jsdocConf, config.readme)
    .done(function(exitCode) {
        process.exit(exitCode);
    });

