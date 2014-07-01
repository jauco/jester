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

module.exports = function createTestFile(filenames, karmaPath, webpackWarningFilters) {
    return webpack({
        entry: createEntryModules(filenames),
        output: {
            path: karmaPath,
            filename: "[name].js"
        },
        module: {
            loaders: [
                {test: /\.json$/, loader: require.resolve("json-loader")}
            ]
        },
        devtool: "#source-map"
    }).then(function(stats) {
        return handleWebpackResult(stats, webpackWarningFilters);
    });
};