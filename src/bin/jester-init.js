#!/usr/bin/env node

var fs = require('fs'),
    p = require("path");

var FEATURES_PATH = "features/"

var defaultConf = require("../template-files/jester.json");

var mkdirp = require('mkdirp');
mkdirp(p.resolve(defaultConf.karmaPath));
mkdirp(p.join(defaultConf.srcPath, defaultConf.entryPath));
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