/** @module lib/rebuildDocumentation */

var child_process = require("child_process"),
    p = require("path"),
    when = require("when");

/** runs jsdoc on srcPath*/
module.exports = function rebuildDocumentation(srcPath, targetPath, confPath, readmePath) {
    var deferred = when.defer();

    var src = p.resolve(srcPath);
    var target = p.resolve(targetPath);
    var conf = p.resolve(confPath);
    var readme = p.resolve(readmePath);

    var args = src + " " +  readme + " -r -d " + target + " -c " + conf;
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