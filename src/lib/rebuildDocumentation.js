var child_process = require("child_process"),
    p = require("path"),
    fs = require("fs"),
    when = require("when");

module.exports = function rebuildDocumentation(srcPath, targetPath, confPath, readmePath) {
    var emptyOrAbsolutePathIfExists = function(path) {
        var absolutePath = p.resolve(path);
        if(fs.existsSync(absolutePath)) {
            return absolutePath;
        }
        else {
            return "";
        }
    };

    var deferred = when.defer();

    var src = p.resolve(srcPath);
    var target = "-d " + p.resolve(targetPath);
    var readme = emptyOrAbsolutePathIfExists(readmePath);
    var options = "-r";
    var conf = emptyOrAbsolutePathIfExists(confPath);
    if(conf) {
        conf = "-c " + conf;
    }

    var node = "node";
    var jsdoc = require.resolve("jsdoc/jsdoc");
    var cmd = [node, jsdoc, readme, src, options, target, conf].join(" ");

    child_process.exec(cmd, function(error, stdout, stderr) {
        if(error !== null) {
            console.error("jsdoc failed!", stderr);
            console.log("jsdoc command was: '", cmd, "'");
            deferred.resolve(error.code);
        }
        else {
            console.log("jsdoc succeeded!", stdout);
            deferred.resolve(0);
        }
    });

    return deferred.promise;
};