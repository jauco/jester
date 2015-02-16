var webpack = require("./webpackPromise"),
    handleWebpackResult = require("./handleWebpackResult"),
    p = require("path");

function createEntryModules(karmaPath, filenames) {
    var entryModules = {};
    if (typeof filenames === "string") {
        filenames = [filenames];
    }

    filenames.forEach(function(file) {
        var featurename = require("path").basename(file.substr(0, file.length - 8));
        entryModules[p.join(karmaPath, featurename)] = file;
        console.log("    * " + featurename + " (" + file + ")." );
    });

    return entryModules;
}

module.exports = function createTestFile(filenames, webpackConfig, karmaPath, webpackWarningFilters) {
    var config = Object.create(webpackConfig);
    config.entry = createEntryModules(karmaPath, filenames);
    return webpack(config).then(function(stats) {
        return handleWebpackResult(stats, webpackWarningFilters);
    });
};
