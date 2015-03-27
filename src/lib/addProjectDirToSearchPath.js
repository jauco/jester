"use strict";
var path = require("path");
var Module = require('module').Module;
var old_nodeModulePaths = Module._nodeModulePaths;

Module._nodeModulePaths = function (from) {
    var paths = 
        old_nodeModulePaths.call(this, from)
        .concat([
            path.resolve(path.join(".", "node_modules"))
        ]);
    return paths;
}
