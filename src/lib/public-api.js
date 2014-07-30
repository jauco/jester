var loadConfig = require("./loadConfig");
var withDefaultKarma = require("./karmaServer").withDefaultOptions;
var withDefaultWebpack = require("./rebuildFiles").interpretWebpackOptions;

module.exports = {
    loadKarmaConfig: function loadKarmaConfig() {
        var config = loadConfig();
        return withDefaultKarma(config.karmaOptions);
    },
    loadWebpackConfig: function loadWebpackConfig() {
        var config = loadConfig();
        return withDefaultWebpack(config, "entrypoints");
    }
}