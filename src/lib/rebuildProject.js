var glob = require("glob");
var p = require("path");
var webpack = require("webpack");
var clearDir = require("./clearDir");

module.exports = function rebuildProject(entryGlob, artifactPath) {
    clearDir(artifactPath, function filesCleared() {
        glob(entryGlob, function (err, featureFiles) {
            var entryModules = {
            };
            console.log("Building artifacts for ", entryGlob, ":");
            featureFiles.forEach(function (file) {
                var featurename = p.basename(p.dirname(file));
                entryModules[featurename] = file;
                console.log("    * " + featurename + " (" + file + ")." );
            });
            webpack({
                entry: entryModules,
                bail: true,
                output: {
                    path: artifactPath,
                    filename: "[name].min.js",
                    chunkFilename: "[id].chunk.js",
                    namedChunkFilename: "[name].chunk.js"
                },
                module: {
                    loaders: [
                        {test: /\.json$/, loader: require.resolve("json-loader")}
                    ]
                },
                devtool: "#source-map",
                plugins: [
                ]
            }, function (err, stats) {
                if (err) {
                    console.error("Rebuild failed!", err);
                } else {
                    console.log("Rebuild succeeded!");
                }
            });
        });
    });
};