var glob = require("../lib/globPromise"),
    webpack = require("../lib/webpackPromise"),
    clearDir = require("./clearDir"),
    handleWebpackResult = require("./handleWebpackResult"),
    p = require("path"),
    overrideConfig = require("figc");

function createEntryModules(filenames, makeFeatureName) {
    var entryModules = {};
    if (typeof filenames === "string") {
        filenames = [filenames];
    }

    filenames.forEach(function (file) {
        var featurename = makeFeatureName(file);
        entryModules[featurename] = file;
        console.log("    * " + featurename + " (" + file + ")." );
    });

    return entryModules;
}   

//FIXME: testen of de json loader inderdaad de eerste in de array van loaders wordt zodat de user hem kan overriden
var defaultConfig = {
    devtool: "#source-map"
    module: {
        loaders: [
            {test: /\.json$/, loader: require.resolve("json-loader")}
        ]
    }
}

function withDefaultOptions(options, type) {
    return overrideConfig(overrideConfig(defaultConfig, options.shared), options[type]);
}

function runWebpack(files, options, makeFeatureName) {
    var filesToBuildAsWebpackOptions = {
        entry: createEntryModules(files, makeFeatureName)
    };
    return webpack(options, filesToBuildAsWebpackOptions));
}

function getNameOfDir(file) {
    return p.basename(p.dirname(file));
}
module.exports.rebuildProject = function rebuildProject(entryGlob, options, webpackWarningFilters) {
    var combinedOptions = withDefaultOptions(options, "entrypoints");

    return clearDir(combinedOptions.output.path)
        .then(function filesCleared() {
            return glob(entryGlob);
        })
        .then(function (files) {
            return runWebpack(files, combinedOptions, getNameOfDir)
        })
        .then(function (stats){
            return handleWebpackResult(stats, webpackWarningFilters);
        });
};

function stripTestJs(file) {
    var testjsLength = ".test.js".length;
    return p.basename(file).slice(0,-testjsLength);
}
module.exports.createTestFile = function createTestFile(filenames, options, webpackWarningFilters) {
    var combinedOptions = withDefaultOptions(options, "testfiles");
    
    return runWebpack(filenames, combinedOptions, stripTestJs)
        .then(function (stats){
            return handleWebpackResult(stats, webpackWarningFilters);
        });
};

module.exports.withDefaultOptions = withDefaultOptions;