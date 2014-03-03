var child_process = require("child_process"),
    p = require("path"),
    fs = require("fs"),
    when = require("when");

module.exports = function rebuildDocumentation(srcPath, targetPath, confPath, readmePath) {
    var deferred = when.defer();

    var src = p.resolve(srcPath);
    var target = p.resolve(targetPath);
    var conf = p.resolve(confPath);
    var readme = p.resolve(readmePath);

    var args = (fs.existsSync(readme) ? readme : "") + " ";

    args = args + src + " -r -d " + target;
    args = (fs.existsSync(conf) ? (args + " -c " + conf) : args);

    var jsdoc = require.resolve("jsdoc/jsdoc") + ".js ";
    var cmd = "node " + jsdoc + args;
    
    console.log("running jsdoc, output is written to " + target);

    child_process.exec(cmd, function(error, stdout, stderr) {
        if(error !== null) {
            console.error("jsdoc failed!", stderr);
            deferred.resolve(error.code);
        }
        else {
            console.log("jsdoc succeeded!", stdout);
            deferred.resolve(0);
        }
    });

    return deferred.promise;
};