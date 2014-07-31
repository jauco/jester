var eslintEngine = require("eslint").CLIEngine,
    formatter = require("eslint-path-formatter"),
    glob = require("./globPromise"),
    p = require("path"),
    readFile = require("fs").readFile,
    when = require("when");

//slightly modified copy from eslint/lib/cli.js:calculateExitCode
function didLintSucceed(results) {
    return results.every(function(result) {
        return result.messages.every(function(message) {
            return message.severity !== 2;
        });
    });
}

function lintFile(filenames, asUnitTest, config) {
    return when.promise(function (resolve, reject, notify) {
        var globals = [
            "require:false"
        ];
        if (asUnitTest) {
            globals = globals.concat([
                "describe:false",
                "it:false",
                "expect:false"
            ]);
        }

        var engine = new eslintEngine({
            rulePaths: [
                //load jester's rules
                p.resolve("./eslint-rules"),
                //load the originating project's rules
                config.eslintRulesDir
            ],
            globals: globals
        });
        if (!Array.isArray(filenames)) {
            filenames = [filenames];
        }
        var result = engine.executeOnFiles(filenames);
        var output = formatter(result.results);
        var lintSucceeded = didLintSucceed(result.results);

        console.log(output);
        resolve(lintSucceeded);
    });
};

module.exports.lintFile = lintFile;