var p = require("path");
var CONFIG_LOCATION = "./jester.json";

module.exports = function loadConfig() {
    var contents = require("fs").readFileSync(CONFIG_LOCATION, {encoding: "utf8"});
    var config = JSON.parse(contents);
    config.eslintRulesDir = p.resolve(config.eslintRulesDir);
    config.srcPath = p.resolve(config.srcPath);
    config.karmaPath = p.resolve(config.karmaPath);
    config.artifactPath = p.resolve(config.artifactPath);
    config.fullEntryGlob = require("path").join(config.srcPath, config.entryGlob);
    config.webpackOptions = require(p.resolve("webpack.config.js"));
    config.configLocation = CONFIG_LOCATION;
    return config;
};
