var webpack = require("webpack");

module.exports = function createTestFile(filenames, karmaPath, cb) {
    var entryModules = {
    };
    if (typeof filenames === "string") {
        filenames = [filenames];
    }
    console.log("Building tests for:");
    filenames.forEach(function (file) {
        var featurename = require("path").basename(file.substr(0, file.length - 8));
        entryModules[featurename] = file;
        console.log("    * " + featurename + " (" + file + ")." );
    });
    try {
        webpack({
            entry: entryModules,
            output: {
                path: karmaPath,
                filename: "[name].js"
            },
            module: {
                loaders: [
                    {test: /\.json$/, loader: require.resolve("json-loader")}
                ]
            },
            devtool: "#inline-source-map",
        }, require("./handleWebpackResult")(cb));
    } catch (e) {
        console.log(e, e.stack);
    }
};
