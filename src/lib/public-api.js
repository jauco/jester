
module.exports = {
    withDefaultKarma: function withDefaultKarma() {
        var withDefaultKarma = require("./karmaServer").withDefaultOptions;
        return withDefaultKarma;
    },
    withDefaultWebpack: function withDefaultWebpack(config, entrypoints) {
        var withDefaultWebpack = require("./rebuildFiles").interpretWebpackOptions;
        var files = require("glob").sync(jesterOptions.fullEntryGlob);
        return withDefaultWebpack("entrypoints", config, entrypoints);
    },
    listEntryFiles: function listEntryFiles() {
        var loadConfig = require("./loadConfig");
        var config = loadConfig();
    }
}