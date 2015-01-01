"use strict";

var fs = require("fs");

function Test(path, options) {
    Test.tests.push(this);
    this.path = path;
    if (path[0] === "/") {
        this.path = this.path.substr(1);
    }
    if (path.substr(-1) === "/") {
        this.path = this.path.substr(0, this.path.length - 1);
    }
    this.identifier = this.path.replace("/", "_SLASH_");
    this.kickstarter = "testKickstarter." + this.identifier + ".js";
    this.filesToWatch = {};
    this.testFramework = options.testFramework;
    this.renderFile();
}
Test.prototype.register = function (id) {
    var self = this;
    var testName = id.substr(0, id.length - 3) + ".test.js";
    fs.stat(testName, function (err) {
        if (!err) {
            if (!self.filesToWatch[id]) {
                self.renderFile();
            }
            self.filesToWatch[id] = testName;
        } else {
            if (self.filesToWatch[id]) {
                self.renderFile();
            }
            self.filesToWatch[id] = undefined;
        }
    });
};
Test.prototype.unRegister = function (id) {
    delete this.filesToWatch[id];
};
Test.prototype.testFile = function () {
    return "<script src='/" + this.path + "/" + this.identifier + ".js'></script>";
};
function dali(template, values) { //a tiny moustache-like template parser. Ha. Ha.
        return template.replace(/\{([a-zA-Z0-9_\-]+)\}/g, function(_, variable) { return values[variable]; });
}
function forEach(filesToWatch, template) {
    return Object.keys(filesToWatch)
        .filter(function (file) { return filesToWatch[file]; })
        .map(function (file) {
            return dali(template, {file: JSON.stringify(file)}) +
                dali(template, {file: JSON.stringify(filesToWatch[file])});
        })
        .join("");
}
Test.prototype.renderFile = function () {
    if (!this.scheduled) {
        process.nextTick(function () {
            var path = require("path");

            var contents = dali(
                "/* This is the testrunner.\n" +
                " */\n" +
                "require({hotpagePath});\n" +
                "var testframework = require({testFrameworkPath});\n" +
                "\n" +
                "if (testframework.initPage) { testframework.initPage(); }\n" +
                "\n" +
                "if (testframework.beforeInitialRun)  { testframework.beforeInitialRun(); }\n" +
                "{requires}" +
                "if (testframework.afterInitialRun) { testframework.afterInitialRun(); }\n" +
                "\n" +
                "if (module.hot) {\n" +
                "{hotReloads}" +
                "}\n",
                {
                    hotpagePath: JSON.stringify(require.resolve("../../hotpage.js")),
                    testFrameworkPath: JSON.stringify(require.resolve(this.testFramework)),
                    requires: forEach(this.filesToWatch, "require({file});\n"),
                    hotReloads: forEach(this.filesToWatch,
                        "    module.hot.accept({file}, function () {\n" +
                        "      testframework.beforeRefresh && testframework.beforeRefresh();\n" +
                        "      require({file});\n" +
                        "      testframework.afterRefresh && testframework.afterRefresh();\n" +
                        "    });\n")
                }
            );
            var file = fs.openSync(path.resolve(this.kickstarter), "w");
            fs.writeSync(file, contents);
            fs.closeSync(file);
        }.bind(this));
    }
};

Test.tests = [];
Test.register = function register(id) {
    Test.tests.forEach(function (t) {
        t.register(id);
    });
};
Test.unRegister = function unRegister(id) {
    Test.tests.forEach(function (t) {
        t.unRegister(id);
    });
};

module.exports = Test;
