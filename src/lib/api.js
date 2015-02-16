"use strict";

var config = require("./loadConfig");

module.exports.injectable = require("../injectable");
module.exports.MINIMAL_REQUIRED_CONFIG = {
  output: {
    path: config.artifactPath
  },
  devtool: "#source-map"
};
module.exports.deepMergeForWebpack = require("deepmerge");
