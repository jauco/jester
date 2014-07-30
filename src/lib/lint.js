var eslintEngine = require("eslint/lib/cli-engine"),
    formatter = require("eslint-path-formatter"),
    glob = require("./globPromise"),
    p = require("path"),
    readFile = require("fs").readFile,
    when = require("when");

//slightly modified copy from eslint/lib/cli.js:calculateExitCode
function didLintSucceed(results) {
    return results.some(function(result) {
        return result.messages.some(function(message) {
            return message.severity === 2;
        });
    });
}

function lintFile(filenames) {
    return when.promise(function (resolve, reject, notify) {
        var engine = new eslintEngine({
            //fixme custom linters
            rulePaths: [
                //load jester's rules
                p.resolve("./eslint-rules"),
                //load the originating project's rules
                p.join(__dirname, "../eslint-rules")
            ]
        });
        if (!Array.isArray(filenames)) {
            filenames = [filenames];
        }
        var result = engine.executeOnFiles(filenames);
        var output = formatter(result.results, undefined); //in eslint/lib/cli.js the formatter is always called with 'options' as the second argument which at that point is always undefined
        var lintSucceeded = didLintSucceed(result.results);

        console.log(output);
        resolve(lintSucceeded);
    });
};

module.exports.lintFile = lintFile;