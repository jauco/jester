"use strict";
var childProcess = require("child_process"),
    p = require("path"),
    fs = require("fs"),
    when = require("when");

module.exports = function rebuildDocumentation(srcPath, targetPath, confPath, readmePath) {
    return when.promise(function (resolve, reject) {
        var pathExists = function(path) {
            return path && fs.existsSync(path);
        };

        var ensurePathExists = function(path, msg) {
            if(!pathExists(path)) {
                throw new Error(msg ? msg : "path does not exist: " + path);
            }
        };

        ensurePathExists(srcPath);
        ensurePathExists(targetPath, "you must define a valid documentation directory by setting apiDocPath in jester.json");

        // define command line options:
        var readme = pathExists(readmePath) ? p.resolve(readmePath) : [];
        var src = p.resolve(srcPath);
        var options = ["-r"];
        var target = ["-d", p.resolve(targetPath)];
        var conf = pathExists(confPath) ? ["-c", p.resolve(confPath)] : [];

        var jsdoc = require.resolve("jsdoc/jsdoc");
        var args = []
            .concat(readme)
            .concat(src)
            .concat(options)
            .concat(target)
            .concat(conf);

        var process = childProcess.fork(jsdoc, args);

        process.on('close', function (code) {
            if (code === 0) {
                console.log("jsdoc documentation successfully written to ", targetPath);
                resolve();
            } else {
                console.error("jsdoc failed! (exit code " + code + "). '" + jsdoc + "' was called with the following arguments:");
                console.error(args.map(function (arg, i) { return " " + i + ": " + arg; }).join("\n"));
                reject();
            }
        });
    });
};
