"use strict";
var glob = require("../lib/globPromise");

function stripTestExtensions(filename) {
    return filename.substr(0, filename.length - 8);
}


function isTestFile(filename) {
    return filename.substr(-8) === ".test.js";
}

function getTestFileNameForPath(path) {
    var result = "";
    if (path.length > 8 && path.substr(-8) === ".test.js") {
        result = path;
    }
    else if (path.length > 3 && path.substr(-3) === ".js") {
        var testfile = path.substr(0, path.length - 3) + ".test.js";

        if (require("fs").existsSync(testfile)) {
            result = testfile;
        }
    }

    return result;
}

function getTestFiles(path) {
    return glob(path + "/**/*.test.js");
}

module.exports.stripTestExtensions = stripTestExtensions;
module.exports.isTestFile = isTestFile;
module.exports.getTestFileNameForPath = getTestFileNameForPath;
module.exports.getTestFiles = getTestFiles;
