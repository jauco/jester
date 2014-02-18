module.exports = function loadConfig(configLocation) {
    var contents = require("fs").readFileSync(configLocation, {encoding: 'utf8'});
    var config = JSON.parse(contents);
    config.fullEntryGlob = require("path").join(config.srcPath, config.entryGlob);
    return config;
}