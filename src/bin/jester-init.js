#!/usr/bin/env node

var fs = require('fs'),
    p = require("path");

var FEATURES_PATH = "features/"

var defaultConf = {
    eslintRulesDir: "./eslint-rules/",
    srcPath: "./src/",
    entryGlob: FEATURES_PATH + "*/feature.js",
    apiDocPath: "./doc/api/",
};

var defaultJSDocConf = {
    "plugins": [ "plugins/markdown" ],
    "tags": {
        "allowUnknownTags": true
    },
    "source": {
        "includePattern": ".+\\.js(doc)?$",
        "excludePattern": "(^|\\/|\\\\)_"
    },
    "templates": {
        "cleverLinks": false,
        "monospaceLinks": false,
        "default": {
            "outputSourceFiles": true
        }
    }
};

var mkdirp = require('mkdirp');
mkdirp(p.resolve(defaultConf.karmaPath));
mkdirp(p.join(defaultConf.srcPath, FEATURES_PATH));
mkdirp(p.join(defaultConf.srcPath, 'lib'));
mkdirp(p.join(defaultConf.srcPath, 'app', 'domain'));
mkdirp(p.resolve(defaultConf.artifactPath));

mkdirp(p.resolve(defaultConf.apiDocPath));
mkdirp(p.resolve(defaultConf.eslintRulesDir));

function writeFileIfNotExists(path, contents) {
    if(fs.existsSync(path)) {
        console.log("file exists, skipped " + path);
    } else {
        console.log("writing new file: " + path);
        fs.writeFileSync(path, contents);
    }
}

writeFileIfNotExists("./jester.json", JSON.stringify(defaultConf, null, 4));
writeFileIfNotExists(defaultConf.jsdocConf, JSON.stringify(defaultJSDocConf, null, 4));