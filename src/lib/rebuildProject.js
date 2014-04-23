var glob = require("../lib/globPromise"),
    p = require("path"),
    webpack = require("webpack"),
    when = require("when"),
    clearDir = require("./clearDir");

module.exports =  function rebuildProject(entryGlob, artifactPath) {
    return clearDir(artifactPath).
        then(function filesCleared() {
            return glob(entryGlob);
        }).
        then(function (featureFiles) {
            var deferred = when.defer();

            var entryModules = {};
            console.log("Building artifacts for ", entryGlob, ":");
            featureFiles.forEach(function (file) {
                var featurename = p.basename(p.dirname(file));
                entryModules[featurename] = file;
                console.log("    * " + featurename + " (" + file + ")." );
            });
            webpack({
                entry: entryModules,
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
            }, require("./handleWebpackResult")(function (hasSucceeded) {
                console.log("webpack finished");
                deferred.resolve(hasSucceeded ? 0 : 1);
            }));
            return deferred.promise;
        });
};
