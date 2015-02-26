"use strict";
var glob = require("../lib/globPromise");

//A file is called "fooBar_whatever.suffix.suffix.js"
//the accompanying testfile is then called fooBar_whatever.suffix.suffix.test.js

var jsSuffix = ".js";
var testSuffix = ".test" + jsSuffix;

function stripTestExtensions(filename) {
    if (isTestFile(filename)) {
      return filename.substr(0, filename.length - testSuffix.length);
    } else {
      return filename;
    }
}

function stripJsExtensions(filename) {
    if (isJsFile(filename)) {
      return filename.substr(0, filename.length - jsSuffix.length);
    } else {
      return filename;
    }
}

function endsWith(str, substr) {
    return str !== substr && str.substr(-substr.length) === substr;
}

function isTestFile(filename) {
    return endsWith(filename, testSuffix);
}

function isJsFile(filename) {
    return endsWith(filename, jsSuffix);
}

function getTestFileNameForPath(path) {
    if (isTestFile(path)) {
        return path;
    } else if (isJsFile(path)) {
        var testfile = stripJsExtensions(path) + testSuffix;
        if (require("fs").existsSync(testfile)) {
            return testfile;
        }
    } else {
      return "";
    }
}

function getTestFiles(path) {
    return glob(path + "/**/*" + testSuffix);
}

module.exports.stripTestExtensions = stripTestExtensions;
module.exports.isTestFile = isTestFile;
module.exports.getTestFileNameForPath = getTestFileNameForPath;
module.exports.getTestFiles = getTestFiles;
