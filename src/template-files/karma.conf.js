var defaultConfigWith = require("jester-tester").karmaConfigWith;
var jesterconfig = require("./jester.json");
module.exports = function (config) {
    config.set(defaultConfigWith({
        basePath: jesterconfig.karmaTestFilePath,
        frameworks: ["jasmine"],
        files: ["*.js"],
        reporters: ["dots"],
        browsers: ['Chrome', 'Firefox', 'IE', 'PhantomJS']
    }))
}