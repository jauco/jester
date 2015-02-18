"use strict";

var config = require("./loadConfig")();
var FileDumper = require("./IncludedFilesDumper");

module.exports.injectable = require("../injectable");
module.exports.MINIMAL_REQUIRED_CONFIG = {
  output: {
    path: config.artifactPath
  },
  devtool: "#source-map",
  plugins: [new FileDumper(require("path").join(config.karmaPath, "entrypointDependencies.json"))]
};
module.exports.deepMergeForWebpack = require("deepmerge");
