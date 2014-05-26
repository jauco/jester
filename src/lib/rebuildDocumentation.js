var child_process = require("child_process"),
    p = require("path"),
    fs = require("fs"),
    when = require("when"),
    whenNode = require("when/node");

module.exports = function rebuildDocumentation(srcPath, targetPath, confPath, readmePath) {

    var toAbsolutePath = function(path) {
        var absolutePath = p.resolve(path);
        if(fs.existsSync(absolutePath)) {
            return absolutePath;
        }
        else {
            return "";
        }
    };

    var src = p.resolve(srcPath);
    var target = "-d " + p.resolve(targetPath);
    var readme = toAbsolutePath(readmePath);
    var options = "-r";
    var conf = toAbsolutePath(confPath);
    if (conf) {
        conf = "-c " + conf;
    }

    var node = "node";
    var jsdoc = require.resolve("jsdoc/jsdoc");
    var cmd = [node, jsdoc, readme, src, options, target, conf].join(" ");

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