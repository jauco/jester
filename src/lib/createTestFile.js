/** @module lib/createTestFile */

var webpack = require("webpack");
var UseStrictPlugin = require("./UseStrictPlugin");
var RewirePlugin = require("rewire-webpack");

/** */
module.exports = function createTestFile(filenames, karmaPath, cb) {
    var entryModules = {
    };
    if (typeof filenames === "string") {
        entryModules["test"] = filenames;
    } else {
        filenames.forEach(function (file) {
            var featurename = require("path").basename(file.substr(0, file.length - 8));
            entryModules[featurename] = file;
        });
    }
    console.log(entryModules, karmaPath);
    try {
        webpack({
            entry: entryModules,
            bail: true,
            output: {
                path: karmaPath,
                filename: "[name].js"
            },
            devtool: "#inline-source-map",
            plugins: [
                new UseStrictPlugin()
            ]
        }, function (err, stats) {
            if (err) {
                console.error("Something went wrong while generating the test file", err);
                cb(false);
            } else {
                console.error("Test files created.");
                cb(true);
            }
        });
    } catch (e) {
        console.log(e, e.stack);
    }
};
