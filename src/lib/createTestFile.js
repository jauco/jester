"use strict";
var webpack = require("./webpackPromise"),
    handleWebpackResult = require("./handleWebpackResult"),
    p = require("path"),
    stripTestExtensions = require("./testFileHelpers").stripTestExtensions;

function createEntryModules(srcPath, filenames) {
    var entryModules = {};
    if (typeof filenames === "string") {
        filenames = [filenames];
    }

    filenames.forEach(function(file) {
        var featurename = require("path").relative(srcPath, stripTestExtensions(file)).replace(/\//g, "_");
        entryModules[featurename] = file;
        console.log("    * " + featurename + " (" + file + ")." );
    });

    return entryModules;
}

module.exports = function createTestFile(filenames, srcPath, webpackConfig, karmaPath, webpackWarningFilters) {
    var config = Object.create(webpackConfig);
    config.output = Object.create(webpackConfig.output);
    config.output.path = karmaPath;
    config.entry = createEntryModules(srcPath, filenames);//fixme output may be null
    config.output = Object.create(config.output || {});
    config.output.filename = "[name].karmatest.js";
    return webpack(config).then(function(stats) {
        return handleWebpackResult(stats, webpackWarningFilters);
    });
};
