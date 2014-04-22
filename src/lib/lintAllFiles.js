var glob = require("./promisedGlob");

module.exports = function lintAllFiles(globPattern) {
    return glob(globPattern).then(function (jsFiles) {
        console.log("Linting '", jsFiles.length, "' file" + (jsFiles.length === 1 ? "" : "s") + ".");
        return when.all(jsFiles.map(function (file) {
            return lintFile(file, config.eslintRules);
        }));
    });
}