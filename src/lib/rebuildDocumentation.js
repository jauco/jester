var child_process = require("child_process"),
    p = require("path"),
    fs = require("fs"),
    whenNode = require("when/node");

module.exports = function rebuildDocumentation(srcPath, targetPath, confPath, readmePath) {
    var pathExists = function(path) {
        return path && fs.existsSync(path);
    };

    var ensurePathExists = function(path, msg) {
        if(!pathExists(path)) {
            throw new Error(msg ? msg : "path does not exist: " + path);
        }
    };

    var enquote = function enquote(str) {
        return "\"" + str + "\"";
    }

    ensurePathExists(srcPath);
    ensurePathExists(targetPath, "you must define a valid documentation directory by setting apiDocPath in jester.json");

    // define command line options:
    var options = "-r";
    var src = enquote(p.resolve(srcPath));
    var target = "-d " + enquote(p.resolve(targetPath));
    var readme = pathExists(readmePath) ? enquote(p.resolve(readmePath)) : "";
    var conf = pathExists(confPath) ? "-c " + enquote(p.resolve(confPath)) : "";

    var jsdoc = require.resolve("jsdoc/jsdoc");
    var cmd = ["node", jsdoc, readme, src, options, target, conf].join(" ");

    var exec = whenNode.lift(child_process.exec);

    return exec(cmd)
        .then(
            function(){
                console.log("jsdoc documentation successfully written to ", targetPath);
            },
            function(error){
                console.error("jsdoc failed!", error);
                console.log("jsdoc command was: ", cmd);
            }
        );
};