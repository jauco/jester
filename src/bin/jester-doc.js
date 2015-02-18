#!/usr/bin/env node
/*eslint no-process-exit: 0*/
"use strict";

var loadConfig = require("../lib/loadConfig"),
    rebuildDocumentation = require("../lib/rebuildDocumentation");

var config = loadConfig();

rebuildDocumentation(config.srcPath, config.apiDocPath, config.jsdocConf, config.readme)
    .done(function(exitCode) {
        process.exit(exitCode);
    });
