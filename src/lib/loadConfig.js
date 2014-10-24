var p = require("path");
var figc = require("figc");
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
    //FIXME: test if command line options work
    var config = figc(
        p.join(process.cwd(), JESTER_CONFIG_FILE), 
        undefined, 
        {mergeImplementation: overrideConfig}
    );
    normalizePaths(config);
    return config;
};