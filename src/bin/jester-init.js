#!/usr/bin/env node

var fs = require('fs'),
    p = require("path");

var FEATURES_PATH = "features/"

var defaultConf = {
    eslintRulesDir: "./eslint-rules/",
    srcPath: "./src/",
    apiDocPath: "./doc/api/",
    jsdocConf: "./jsdoc.conf",
    readme: "./readme.md",
    entryGlob: FEATURES_PATH + "*/feature.js",
    karmaPath: "./build/karma/",
    artifactPath: "./build/artifacts",
    karmaOptions: {
        proxies: {},
        browsers: ['Chrome', 'Firefox', 'IE', 'PhantomJS'],
    }
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
}

var defaultReadme = "# README \n\
  \n\
  * Replace this readme with useful info about your app \n\
  * [Start writing features](https://github.com/jauco/jester/blob/master/README.md#writing-features-with-jester) \n\
  * Write unittests with [jasmine](http://jasmine.github.io/2.0/introduction.html) \n\
  * Document your project with [jsdoc](http://usejsdoc.org/)";

var mkdirp = require('mkdirp');
mkdirp(p.resolve(defaultConf.karmaPath));
mkdirp(p.join(defaultConf.srcPath, FEATURES_PATH));
mkdirp(p.join(defaultConf.srcPath, 'lib'));
mkdirp(p.join(defaultConf.srcPath, 'app', 'domain'));
mkdirp(p.resolve(defaultConf.artifactPath));

mkdirp(p.resolve(defaultConf.apiDocPath));

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
writeFileIfNotExists(defaultConf.readme, defaultReadme);
