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
var Test = require("./Test");
var StartEndlistener = require("./StartEndListener");

var testApp = connect();
var server = require("http").createServer(testApp);
var io = require("socket.io")(server);
io.on("connection", function(){
});
(function () {
if (config.jester && config.jester.tests) {
    for (var path in config.jester.tests) {
        var test = new Test(path, config.jester.tests[path]);
        var customConfig = Object.create(config);
        customConfig.entry = {};
        customConfig.entry[test.identifier] = ["./" + test.kickstarter];
        customConfig.output = Object.create(customConfig.output);
        customConfig.output.publicPath = "/" + test.path + "/";
        var testCompiler = webpack(customConfig);
        var testListener = new StartEndlistener(testCompiler);
        var isRunning = false;
        testListener.event(function () {
            console.log("test build: failed", testListener.failed, "running", testListener.running);
            if (isRunning && !testListener.running) {
                io.emit("change-end", {success: !testListener.failed});
            }
            isRunning = testListener.running;
        });
        var mw2 = webpackDevMiddleware(testCompiler, {
            publicPath: "/" + test.path + "/",
            hot: true,
            quiet: true
        });
        testApp.use(function (req) { console.log("testApp", req.path); return mw2.apply(this, arguments); });
        testApp.use(function (req, res) {
            res.end(test.testFile());
        });
    }
}
}());

server.listen(portForTests);

var compiler = webpack(config);
var listener = new StartEndlistener(compiler);
listener.event(function (data) {
    if (data) {
        data.added.forEach(function (f) { Test.register(f); });
        data.removed.forEach(function (f) { Test.unRegister(f); });
    }
    console.log("Main build: failed", listener.failed, "running", listener.running);
});
//override any calls to the scriptpath with the webpackmiddleware
app.use(webpackDevMiddleware(compiler, {
    publicPath: scriptPath,
    quiet: true,
    hot: false
}));
//proxy all other requests
app.use(function (req, res) {
    debugServerProxy.web(req, res, debugServerUrl, function(err) {
        console.log("error while proxying in jester watch", err, req);
    });
});
app.listen(portForServer);
