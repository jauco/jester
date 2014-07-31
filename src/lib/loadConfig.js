var p = require("path");
var confuse = require("confuse");
var JESTER_CONFIG_FILE="jester.json"
var overrideConfig = require("./overrideConfig")
var loadedConfigFiles = [];

function normalizePaths(config) {
    config.eslintRulesDir = p.resolve(config.eslintRulesDir);
    config.srcPath = p.resolve(config.srcPath);
    config.karmaPath = p.resolve(config.karmaPath);
    config.artifactPath = p.resolve(config.artifactPath);
    config.fullEntryGlob = require("path").join(config.srcPath, config.entryGlob);
}

module.exports = function loadConfig() {
    //FIXME: test if command line options work
    var config = confuse({
        dir: process.cwd(),
        files: [JESTER_CONFIG_FILE],
        mergeImplementation: overrideConfig,
        returnConfigFileList: "__loadedConfigFiles"
    });
    normalizePaths(config);
    loadedConfigFiles = config.__loadedConfigFiles;
    delete config.__loadedConfigFiles;
    return config;
};

module.exports.isConfigFile = function (path) {
    return loadedConfigFiles.indexOf(p.resolve(path)) > -1;
}
module.exports.configFiles = function () {
    return loadedConfigFiles;
}