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
}   

module.exports =  function rebuildProject(entryGlob, artifactPath) {
    return clearDir(artifactPath)
        .then(function filesCleared() {
            return glob(entryGlob);
        })
        .then(function (featureFiles) {
            return webpack({
                entry: createEntryModules(featureFiles),
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
            });
        })
        .then(function (stats){
            return handleWebpackResult(stats);
        });
};