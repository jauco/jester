"use strict";
var glob = require("../lib/globPromise");

//A file is called "fooBar_whatever.suffixA.suffixB.js"
//the accompanying testfile is then called one fooBar_whatever[.optional.suffixes].test.js
//when more then one testfile matches all are returned (test file matching is only
//used for selecting what tests to run in watch mode)

var jsSuffix = ".js";
var testSuffix = ".test" + jsSuffix;
var p = require("path");
var when = require("when");

function stripTestExtensions(filename) {
    if (isTestFile(filename)) {
      return filename.substr(0, filename.length - testSuffix.length);
    } else {
      return filename;
    }
}

function stripJsExtensionsAndSuffixes(filename) {
    if (isJsFile(filename)) {
      var basename = p.basename(filename);
      var dirname = p.dirname(filename);
      return p.join(dirname, basename.split(".")[0]);
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

function getTestFileNamesForPath(path) {
    if (isTestFile(path)) {
        return when.promise(function(resolve, reject) {
            resolve([path]);
        });
    } else if (isJsFile(path)) {
        var testfileGlob = stripJsExtensionsAndSuffixes(path) + "*" + testSuffix;
        return glob(testfileGlob);
    } else {
        return when.promise(function(resolve, reject) {
            resolve([]);
        });
    }
}

function getTestFiles(path) {
    return glob(path + "/**/*" + testSuffix);
}

module.exports.stripTestExtensions = stripTestExtensions;
module.exports.isTestFile = isTestFile;
module.exports.getTestFileNamesForPath = getTestFileNamesForPath;
module.exports.getTestFiles = getTestFiles;
