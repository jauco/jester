/*globals __dirname */
var p = require("path");
var eslint = require("eslint").linter;
var rulesLoader = require("eslint/lib/rules");
rulesLoader.load(p.resolve("./eslint-rules"));
rulesLoader.load(p.join(__dirname, "../eslint-rules"));
var formatter = require("eslint-path-formatter");
var when = require("when");

module.exports = function lintFile(filename, rules, cb) {
    return when.promise(function (resolve, reject, notify) {
        require("fs").readFile(filename, {encoding: "utf8"}, function (err, file) {
            if (err) {
                reject(err);
            } else {
                //Jslint doesn't get an env or globals. Specify globals in the source files like so:
                // /*globals document:false, window: false*/
                var globals = {
                    "require": true,
                    "module": true,
                    "console": true
                };
                if (filename.substr(-8) === ".test.js") {
                    globals["describe"] = true;
                    globals["it"] = true;
                    globals["expect"] = true;
                }
                var config = {
                    rules: rules,
                    globals: globals
                };
                var result = eslint.verify(file, config);
                var lintSucceeded = true;
                if (result) {
                    lintSucceeded = !result.some(function (message) {
                        return message.fatal || (rules[message.ruleId][0] || rules[message.ruleId]) === 2;
                    });
                }
                if (result && result.length > 0) {
                    console.log(filename + ":");
                    console.log(formatter([{
                        messages: result,
                        filePath: filename
                    }], config));
                }
                if (lintSucceeded) {
                    resolve();
                } else {
                    reject();
                }
            }
        });
    });
};