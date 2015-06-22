#!/usr/bin/env node
"use strict";

var fs = require("fs"),
    p = require("path");

var FEATURES_PATH = "features/";
var ARTIFACT_PATH = "./build/artifacts";

var defaultConf = {
    eslintRulesDir: "./eslint-rules/",
    srcPath: "./src/",
    apiDocPath: "./doc/api/",
    jsdocConf: "./jsdoc.conf",
    readme: "./readme.md",
    entryGlob: FEATURES_PATH + "*/feature.js",
    karmaPath: "./build/karma/",
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
};

var defaultWebpackConfig = '"use strict";\n\
//MINIMAL_REQUIRED_CONFIG contains those few options that are needed for webpack\n\
//to integrate with the rest of the tools. You can override them by making\n\
//MINIMAL_REQUIRED_CONFIG the first argument to the deepmerge function so your\n\
//own settings overwrite the MINIMAL settings. This will probably break things.\n\
var jester = require("jester-tester");\n\
module.exports = jester.deepMergeForWebpack({\n\
  entry: {\n\
    "app": "./src/app.js"\n\
  },\n\
  output: {\n\
    path: ' + JSON.stringify(ARTIFACT_PATH) + ', \n\
    filename: "[name].min.js",\n\
    chunkFilename: "[id].chunk.js",\n\
    namedChunkFilename: "[name].chunk.js"\n\
  },\n\
  module: {\n\
    loaders: [\n\
      {test: /\.json$/, loader: "json-loader"},\n\
    ]\n\
  }\n\
}, jester.MINIMAL_REQUIRED_CONFIG);\n\
//console.log(module.exports); //to see the config that is used.\n';

var defaulteslintrc = {
  "env": {
    "browser": true
  },
  "globals": {
    "require": false,
    "module": false
  },
  "rules": {
    "strict": [2, "global"],
    "global-strict": 0
  }
};

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
mkdirp(p.resolve(ARTIFACT_PATH));

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
writeFileIfNotExists("./.eslintrc", JSON.stringify(defaulteslintrc, null, 4));
writeFileIfNotExists(defaultConf.jsdocConf, JSON.stringify(defaultJSDocConf, null, 4));
writeFileIfNotExists(defaultConf.readme, defaultReadme);
writeFileIfNotExists("./webpack.config.js", defaultWebpackConfig);
