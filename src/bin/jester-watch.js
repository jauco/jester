#!/usr/bin/env node
"use strict";
var connect = require("connect");
var webpackDevMiddleware = require("webpack-dev-middleware");
var webpack = require("webpack");
var proxy = require("http-proxy");
var debugServerProxy = proxy.createProxyServer();

var debugServerUrl;
var scriptPath = "/scripts";
var portForServer = 8080;
var portForTests = 8081;

var config;
function log(s/*, lvl*/) {
    console.log(s);
}
log.NORMAL = 0;
log.ERROR = 1;
//try {
    //console.log(require.resolve("./webpack.config"));
    config = require(require("path").resolve("./webpack.config"));
//} catch (e) {
//    log("No config found. Falling back to default config.", log.ERROR);
    //config = require("./webpack.config");
//}

var app = connect();
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
            self.filesToWatch[testName] = true;
            self.renderFile();
        } else {
            self.filesToWatch[testName] = false;
        }
    });
};
Test.prototype.unRegister = function (id) {
    var testName = id.substr(0, id.length - 3) + ".test.js";
    delete this.filesToWatch[testName];
};
Test.prototype.testFile = function () {
    return "<script src='/" + this.path + "/" + this.identifier + ".js'></script>";
};
Test.prototype.renderFile = function () {
    var path = require("path");
    var self = this;
    var contents =
        "/* This is the testrunner.\n" +
        " */\n" +
        "require(" + JSON.stringify(require.resolve("../../hotpage.js")) + ");\n" +
        "var testframework = require(" + JSON.stringify(require.resolve(this.testFramework))  + ");\n" +
        "\n" +
        "if (testframework.initPage) { testframework.initPage(); }\n" +
        "\n" +
        "if (testframework.beforeInitialRun)  { testframework.beforeInitialRun(); }\n" +
        Object.keys(this.filesToWatch)
            .filter(function (file) { return self.filesToWatch[file]; })
            .map(function (file) {
                return "require(" + JSON.stringify(file) + ");\n";
            })
            .join("") +
        "if (testframework.afterInitialRun) { testframework.afterInitialRun(); }\n" +
        "\n" +
        "if (module.hot) {\n" +
            Object.keys(this.filesToWatch)
                .filter(function (file) { return self.filesToWatch[file]; })
                .map(function (file) {
                    return "    module.hot.accept(" + JSON.stringify(file) + ", function () {\n" +
                    "      testframework.beforeRefresh && testframework.beforeRefresh();\n" +
                    "      require(" + JSON.stringify(file) + ");\n" +
                    "      testframework.afterRefresh && testframework.afterRefresh();\n" +
                    "    });\n";
                })
                .join("") +
        "}\n";
    var file = fs.openSync(path.resolve(this.kickstarter), "w");
    fs.writeSync(file, contents);
    fs.closeSync(file);
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
//add a watch for file creation and deletion when a file is created or deleted notifie the tests so they can update themselves if necessary

var compiler = webpack(config);
//override any calls to the scriptpath with the webpackmiddleware
var mw = webpackDevMiddleware(compiler, {
    publicPath: scriptPath,
    info: true,
    hot: false
});
app.use(function (req, res, next) { console.log("app", req.url); return mw.call(this, req, res, next); });
//whenever a new file is added
//do the same dance as in webpack dev middleware to make sure that we don't
//run in the middle of a compile
var compilationSucceeded = false;
var registeredFiles = {};
compiler.plugin("done", function (stats) {
    compilationSucceeded = true;
    io.emit("change-end", {success: true});
    process.nextTick(function () {
        if (!compilationSucceeded) {
            //a new compile was triggered so we wait for the done callback of that one
            return;
        } else {
            stats = stats.toJson({modules: true});
            var _registeredFiles = {};
            for (var i in registeredFiles) {
                if (registeredFiles.hasOwnProperty(i)) {
                    _registeredFiles[i] = registeredFiles[i];
                }
            }
            stats.modules.forEach(function (m) {
                if (registeredFiles[m.identifier]) {
                    //tests already registered, no need to unregister them later on
                    delete _registeredFiles[m.identifier];
                } else {
                    registeredFiles[m.identifier] = true;
                    Test.register(m.identifier);
                }
            });
            for (var m in _registeredFiles) {
                if (_registeredFiles.hasOwnProperty(m)){
                    Test.unRegister(m.identifier);
                }
            }
        }
    });
});
// on compiling
function setCompilationState() {
    compilationSucceeded = false;
    io.emit("change-end", {success: false});
}
compiler.plugin("invalid", setCompilationState);
compiler.plugin("compile", function () {compilationSucceeded = false; io.emit("change-start");});
//proxy all other requests
app.use(function (req, res) {
    debugServerProxy.web(req, res, debugServerUrl, function(err) {
        console.log("error while proxying in jester watch", err, req);
    });
});
app.listen(portForServer);

var testApp = connect();
(function () {
if (config.jester && config.jester.tests) {
    for (var path in config.jester.tests) {
        var test = new Test(path, config.jester.tests[path]);
        var customConfig = Object.create(config);
        customConfig.entry = {};
        customConfig.entry[test.identifier] = ["webpack/hot/dev-server", "./" + test.kickstarter];
        customConfig.output = Object.create(customConfig.output);
        customConfig.output.publicPath = "/" + test.path + "/";
        var testCompiler = webpack(customConfig);
        var mw2 = webpackDevMiddleware(testCompiler, {
            publicPath: "/" + test.path + "/",
            hot: true
        });
        testApp.use(function (req) { console.log("testApp", req.path); return mw2.apply(this, arguments); });
        testApp.use(function (req, res) {
            res.end(test.testFile());
        });
    }
}
}());

var server = require("http").Server(testApp);
var io = require("socket.io")(server);
io.on("connection", function(){ /* … */ });
server.listen(portForTests);
