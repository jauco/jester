var p = require("path");
var confuse = require("confuse");
var JESTER_CONFIG_FILE="jester.json"

function normalizePaths(config) {
    config.eslintRulesDir = p.resolve(config.eslintRulesDir);
    config.srcPath = p.resolve(config.srcPath);
    config.karmaPath = p.resolve(config.karmaPath);
    config.artifactPath = p.resolve(config.artifactPath);
    config.fullEntryGlob = require("path").join(config.srcPath, config.entryGlob);
}

module.exports = function loadConfig(configLocation) {
    var config = confuse({files: [configLocation]}); //FIXME: test if command line options work
    normalizePaths(config);
    return config;
};

module.exports.isConfigFile = function (path) {
    return path.substr(-(JESTER_CONFIG_FILE.length)) === JESTER_CONFIG_FILE;
}