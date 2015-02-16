var webpack = require("./webpackPromise"),
    handleWebpackResult = require("./handleWebpackResult");

function createEntryModules(filenames) {
    var entryModules = {};
    if (typeof filenames === "string") {
        filenames = [filenames];
    }

    filenames.forEach(function(file) {
        var featurename = require("path").basename(file.substr(0, file.length - 8));
        entryModules[featurename] = file;
        console.log("    * " + featurename + " (" + file + ")." );
    });

    return entryModules;
}

module.exports = function createTestFile(filenames, webpackConfig, karmaPath, webpackWarningFilters) {
    var config = Object.create(webpackConfig);
    config.entry = createEntryModules(filenames);
    if (config.output){
        config.output = Object.create(config.output);
    } else {
        config.output = {};
    }
    config.output.path = karmaPath;
    return webpack(config).then(function(stats) {
        return handleWebpackResult(stats, webpackWarningFilters);
    });
};
