var glob = require("../lib/globPromise"),
    webpack = require("../lib/webpackPromise"),
    clearDir = require("./clearDir"),
    handleWebpackResult = require("./handleWebpackResult"),
    p = require("path"),
    overrideConfig = require("./overrideConfig");

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
    devtool: "#source-map",
    output: {
        filename: "[name].min.js"
    },
    module: {
        loaders: [
            {test: /\.json$/, loader: require.resolve("json-loader")}
        ]
    }
}

function interpretRegexp(obj, name) {
    function perVal(val) {
        if (typeof val === "string" && val.slice(0,8) === "RegExp('" && val.slice(-2) === "')") {
            return new RegExp(val.slice(8,-2));
        } else {
            return val;
        }
    }

    if (obj && name in obj) {
        if (Array.isArray(obj[name])) {
            obj[name] = obj[name].map(perVal);
        } else {
            obj[name] = perVal(obj[name]);
        }
    }
}

function interpretRegexpForLoader(obj, propName) {
    if (obj && Array.isArray(obj[propName])){
        obj[propName].forEach(function (loader) {
            interpretRegexp(loader, "test");
            interpretRegexp(loader, "include");
            interpretRegexp(loader, "exclude");
        });
    }
}

function interpretWebpackOptions(options, buildType) {
    var result = overrideConfig(overrideConfig(defaultConfig, options.shared), options[buildType]);
    interpretRegexpForLoader(result.module, "loaders");
    interpretRegexpForLoader(result.module, "preLoaders");
    interpretRegexpForLoader(result.module, "postLoaders");

    interpretRegexp(result.module, "noParse");

    interpretRegexp(result.module, "exprContextRegExp");
    interpretRegexp(result.module, "wrappedContextRegExp");
    interpretRegexp(result.module, "unknownContextRegExp");

    interpretRegexp(result.resolve, "unsafeCache");
    interpretRegexp(result.resolveLoader, "unsafeCache");

    interpretRegexp(result, "externals");
    return result;
}

function getWebpackOptionsForStandaloneRun(jesterOptions) {
    var options = interpretWebpackOptions(jesterOptions.webPackOptions, "entrypoints");
    var files = require("glob").sync(jesterOptions.fullEntryGlob);
    var filesToBuildAsWebpackOptions = {
        entry: createEntryModules(files, getNameOfDir)
    };
    return overrideConfig(options, filesToBuildAsWebpackOptions);
}

function runWebpack(files, options, makeFeatureName) {
    var filesToBuildAsWebpackOptions = {
        entry: createEntryModules(files, makeFeatureName)
    };
    return webpack(overrideConfig(options, filesToBuildAsWebpackOptions));
}

function getNameOfDir(file) {
    return p.basename(p.dirname(file));
}
module.exports.rebuildProject = function rebuildProject(jesterOptions) {
    var combinedOptions = interpretWebpackOptions(jesterOptions.webPackOptions, "entrypoints");

    return clearDir(combinedOptions.output.path)
        .then(function filesCleared() {
            return glob(jesterOptions.fullEntryGlob);
        })
        .then(function (files) {
            return runWebpack(files, combinedOptions, getNameOfDir);
        })
        .then(function (stats){
            return handleWebpackResult(stats, jesterOptions.webpackWarningFilters);
        });
};

function stripTestJs(file) {
    var testjsLength = ".test.js".length;
    return p.basename(file).slice(0,-testjsLength);
}
module.exports.createTestFile = function createTestFile(filenames, jesterOptions) {
    var combinedOptions = interpretWebpackOptions(jesterOptions.webPackOptions, "testfiles");
    
    return runWebpack(filenames, combinedOptions, stripTestJs)
        .then(function (stats){
            return handleWebpackResult(stats, jesterOptions.webpackWarningFilters);
        });
};

module.exports.interpretWebpackOptions = getWebpackOptionsForStandaloneRun;