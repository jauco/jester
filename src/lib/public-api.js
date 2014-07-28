var loadConfig = require("./loadConfig");
var withDefaultKarma = require("./karmaServer").withDefaultOptions;
var withDefaultWebpack = require("./rebuildFiles").withDefaultOptions;
var overrideConfig = require("deepmerge");

module.exports = {
    loadKarmaConfig: function loadKarmaConfig() {
        var config = loadConfig();
        return withDefaultKarma(config.karmaOptions);
    },
    loadWebpackConfig: function loadWebpackConfig() {
        var config = loadConfig();
        config = overrideConfig(config.webPackOptions, "entrypoints")
        return withDefaultWebpack(config);
    }
}