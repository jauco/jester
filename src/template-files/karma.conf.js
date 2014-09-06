var defaultConfigWith = require("jester-tester").karmaConfigWith;
module.exports = function (config) {
    config.set(defaultConfigWith({
        basePath: "./build/karma/",
        frameworks: ["jasmine"],
        files: ["*.js"],
        reporters: ["dots"],
        browsers: ['Chrome', 'Firefox', 'IE', 'PhantomJS']
    }))
}