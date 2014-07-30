var p = require("path");
var confuse = require("confuse");
var JESTER_CONFIG_FILE="jester.json"
var overrideConfig = require("./overrideConfig")

function normalizePaths(config) {
    config.eslintRulesDir = p.resolve(config.eslintRulesDir);
    config.srcPath = p.resolve(config.srcPath);
    config.karmaPath = p.resolve(config.karmaPath);
    config.artifactPath = p.resolve(config.artifactPath);
    config.fullEntryGlob = require("path").join(config.srcPath, config.entryGlob);
}

module.exports = function loadConfig() {
    var config = confuse({dir: process.cwd(), files: [JESTER_CONFIG_FILE], mergeImplementation: overrideConfig}); //FIXME: test if command line options work
    normalizePaths(config);
    return config;
};

module.exports.isConfigFile = function (path) {
    return path.substr(-(JESTER_CONFIG_FILE.length)) === JESTER_CONFIG_FILE;
}