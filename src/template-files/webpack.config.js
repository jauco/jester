/**************************
This module will provide webpack with a config file that is identical to how its
executed when jester generates 


*************************/

var webpackConfigWith = require("jester-tester").webpackConfigWith;
var entrypoints = require("jester-tester").listEntryFiles;
var webpackSettings = require("./webpack_all_configs");

module.exports = webpackConfigWith(webpackSettings, entrypoints);