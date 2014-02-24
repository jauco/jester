var p = require("path");
var eslint = require("eslint").linter;
var rules_loader = require("eslint/lib/rules");
rules_loader.load(p.resolve("./eslint-rules"));
rules_loader.load(p.join(__dirname, "../eslint-rules"));
var formatter = require("eslint-path-formatter")

module.exports = function lintFile(filename, rules, cb) {
    require("fs").readFile(filename, {encoding: 'utf8'}, function (err, file) {
        if (err) {
            console.log(err);
            cb(false);
        } else {
            //Jslint doesn't get an env or globals. Specify globals in the source files like so:
            // /*globals document:false, window: false*/
            var config = {
                rules: rules,
                globals: {
                "require": true,
                    "module": true
            }
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
            cb(lintSucceeded);
        }
    });
};