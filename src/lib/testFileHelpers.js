"use strict";
var glob = require("../lib/globPromise");

//A file is called "fooBar_whatever.suffix.suffix.js"
//the accompanying testfile is then called fooBar_whatever.suffix.suffix.test.js

var jsSuffix = ".js";
var testSuffix = ".test" + jsSuffix;

function stripTestExtensions(filename) {
    return filename.substr(0, filename.length - testSuffix.length);
}


function isTestFile(filename) {
    return filename.substr(-testSuffix.length) === ".test.js";
}

function getTestFileNameForPath(path) {
    var result = "";
    if (path.length > testSuffix.length && path.substr(-testSuffix.length) === ".test.js") {
        result = path;
    }
    else if (path.length > jsSuffix.length && path.substr(-jsSuffix.length) === ".js") {
        var testfile = path.substr(0, path.length - jsSuffix.length) + ".test.js";

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
