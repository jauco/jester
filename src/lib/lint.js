var eslint = require("eslint").linter,
    formatter = require("eslint-path-formatter"),
    glob = require("./globPromise"),
    p = require("path"),
    readFile = require("fs").readFile,
    rulesLoader = require("eslint/lib/rules"),
	isTestFile = require("./isTestFile"),
    when = require("when");

rulesLoader.load(p.resolve("./eslint-rules"));
rulesLoader.load(p.join(__dirname, "../eslint-rules"));

function lintFile(filename, rules) {
    return when.promise(function (resolve, reject, notify) {
        readFile(filename, {encoding: "utf8"}, function (err, file) {
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
                if (isTestFile(filename)) {
                    globals["describe"] = true;
                    globals["it"] = true;
                    globals["expect"] = true;
                }
                var config = {
                    rules: rules,
                    globals: globals
                };

                var result = eslint.verify(file, config);

                var hasError = function(eslintMessage) {
                    return eslintMessage.fatal || // parse error, or:
                        (rules[eslintMessage.ruleId][0] || rules[eslintMessage.ruleId]) === 2; // lint error
                };

                var lintSucceeded = true;

                if (result && result.length > 0) {
                    lintSucceeded = !result.some(hasError);

                    console.log(filename + ":");
                    console.log(formatter([{
                        messages: result,
                        filePath: filename
                    }], config));
                }

                resolve(lintSucceeded);
            }
        });
    });
};

function lintGlob(globPattern, rules) {
    return glob(globPattern).then(function (jsFiles) {
        console.log("Linting ", jsFiles.length, " file" + (jsFiles.length === 1 ? "" : "s") + ".");
        return when.map(jsFiles, function (file) {
            return lintFile(file, rules);
        }).then(function(values) {
            return values.every(function(x) { return x; });
        });
    });
}

module.exports.lintFile = lintFile;
module.exports.lintGlob = lintGlob;
