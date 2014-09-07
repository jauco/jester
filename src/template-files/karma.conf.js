var defaultConfigWith = require("jester-tester").karmaConfigWith;
module.exports = function (config) {
    config.set(defaultConfigWith({
        frameworks: [
            "jasmine"
        ],
        files: [
            "*.js"
        ],
        reporters: [
            "dots"
        ],
        browsers: [
            'Chrome',
            'Firefox',
            'IE',
            'PhantomJS'
        ]
    }))
}