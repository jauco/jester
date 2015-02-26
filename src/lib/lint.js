"use strict";
var CLIEngine = require("eslint").CLIEngine,
    formatter = require("eslint-path-formatter"),
    glob = require("./globPromise"),
    existsSync = require("fs").existsSync,
    when = require("when"),
    isTestFile = require("./testFileHelpers").isTestFile;


function lintFile(filename, eslintRulesDir) {
    return when.promise(function (resolve, reject, notify) {
        var rulePaths;
        if (existsSync(eslintRulesDir)) {
            rulePaths = [ eslintRulesDir ];
        } else {
            rulePaths = [];
        }
        var opts = {
            rulePaths: rulePaths
        };
        if (isTestFile(filename)) {
            opts.envs = ["jasmine"];
        }
        var eslint = new CLIEngine(opts);

        if (eslint.isPathIgnored(filename)) {
            console.log(filename + ":");
            console.log(" [ignored by eslint. Check .eslintignore files]");
            resolve(true);
        } else {
            var results = eslint.executeOnFiles([filename]).results;

            if (results) {
                var lintSucceeded =
                    !results.some(function (result) {
                        return result.messages.some(function(eslintMessage) {
                            return eslintMessage.fatal || // parse error, or:
                                eslintMessage.severity === 2; // lint error
                        });
                    });
                if (results.some(function(result) { return result.messages.length > 0; })) {
                    console.log(formatter(results));
                }
                resolve(lintSucceeded);
            } else {
                reject("Eslint returned no results!");
            }
        }
    });
}

function lintGlob(globPattern, eslintRulesDir) {
    return glob(globPattern).then(function (jsFiles) {
        console.log("Linting ", jsFiles.length, " file" + (jsFiles.length === 1 ? "" : "s") + ".");
        return when.map(jsFiles, function (file) {
            return lintFile(file, eslintRulesDir);
        }).then(function(values) {
            return values.every(function(x) { return x; });
        });
    });
}

module.exports.lintFile = lintFile;
module.exports.lintGlob = lintGlob;
