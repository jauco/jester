var glob = require("../lib/globPromise"),
    p = require("path"),
    webpack = require("../lib/webpackPromise"),
    when = require("when"),
    clearDir = require("./clearDir"),
    handleWebpackResult = require("./handleWebpackResult");

function createEntryModules(featureFiles) {
    var entryModules = {};
    
    featureFiles.forEach(function (file) {
        var featurename = p.basename(p.dirname(file));
        entryModules[featurename] = file;
        console.log("    * " + featurename + " (" + file + ")." );
    });
}   

module.exports =  function rebuildProject(entryGlob, artifactPath) {
    return clearDir(artifactPath).
        then(function filesCleared() {
            return glob(entryGlob);
        }).
        then(function (featureFiles) {
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
        }).
        then(function(stats){
            console.log("Building succeeded!");
        });
};


// , require("./handleWebpackResult")(function (hasSucceeded) {
//                 console.log("webpack finished");
//                 deferred.resolve(hasSucceeded ? 0 : 1);
//             })