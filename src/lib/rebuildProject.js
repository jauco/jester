var glob = require("../lib/globPromise"),
    webpack = require("../lib/webpackPromise"),
    clearDir = require("./clearDir"),
    handleWebpackResult = require("./handleWebpackResult"),
    p = require("path");

function createEntryModules(featureFiles) {
    var entryModules = {};

    featureFiles.forEach(function (file) {
        var featurename = p.basename(p.dirname(file));
        entryModules[featurename] = file;
        console.log("    * " + featurename + " (" + file + ")." );
    });

    return entryModules;
}

module.exports = function rebuildProject(webpackConfig, entryGlob, artifactPath, webpackWarningFilters) {
    return clearDir(artifactPath)
        .then(function filesCleared() {
            return glob(entryGlob);
        })
        .then(function (featureFiles) {
            var config = Object.create(webpackConfig);
            config.entry = createEntryModules(featureFiles);
            if (config.output){
              config.output = Object.create(config.output);
            } else {
              config.output = {};
            }
            config.output.path = artifactPath;
            return webpack(config);
        })
        .then(function (stats){
            return handleWebpackResult(stats, webpackWarningFilters);
        });
};
