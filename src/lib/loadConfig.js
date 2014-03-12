var p = require("path");

module.exports = function loadConfig(configLocation) {
    var contents = require("fs").readFileSync(configLocation, {encoding: "utf8"});
    var config = JSON.parse(contents);
    config.eslintRulesDir = p.resolve(config.eslintRulesDir);
    config.srcPath = p.resolve(config.srcPath);
    config.karmaPath = p.resolve(config.karmaPath);
    config.artifactPath = p.resolve(config.artifactPath);
    config.fullEntryGlob = require("path").join(config.srcPath, config.entryGlob);
    return config;
};
