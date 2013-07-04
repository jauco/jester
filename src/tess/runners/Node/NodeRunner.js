---
expects:
    require: http://nodejs.org/api/modules.html
    _path: http://nodejs.org/api/path.html
    _os: http://nodejs.org/api/os.html
    _fs: http://nodejs.org/api/fs.html
    _debugger: https://npmjs.org/package/node-inspector
    _child_process: http://nodejs.org/api/child_process.html
    setTimeout: http://www.w3.org/TR/html5/webappapis.html#timers
    console: http://developer.mozilla.org/en-US/docs/DOM/console.log
dependencies:
    Runner: ../Runner
    rsvp: tools/rsvp
    path: tools/node-wrappers/path
    fs: tools/node-wrappers/fs
    child_process: tools/node-wrappers/child_process
---
---
---
var os = require('os');

var NodeRunnerProvides = [
    "http://jauco.nl/applications/jester/1/resultCallback",

    "http://developer.mozilla.org/en-US/docs/DOM/console.log",

    "http://www.w3.org/TR/html5/webappapis.html#timers",

    //FIXME: be able to parse commonjs modules so we can include these as a dependency instead of an expectation
    "https://npmjs.org/package/js-yaml",
    "https://npmjs.org/package/jshint",
    "https://npmjs.org/package/node-inspector",
    "https://github.com/mishoo/UglifyJS",

    "http://nodejs.org/api/assert.html",
    "http://nodejs.org/api/buffer.html",
    "http://nodejs.org/api/addons.html",
    "http://nodejs.org/api/child_process.html",
    "http://nodejs.org/api/cluster.html",
    "http://nodejs.org/api/crypto.html",
    "http://nodejs.org/api/debugger.html",
    "http://nodejs.org/api/dns.html",
    "http://nodejs.org/api/domain.html",
    "http://nodejs.org/api/events.html",
    "http://nodejs.org/api/fs.html",
    "http://nodejs.org/api/globals.html",
    "http://nodejs.org/api/http.html",
    "http://nodejs.org/api/https.html",
    "http://nodejs.org/api/modules.html",
    "http://nodejs.org/api/net.html",
    "http://nodejs.org/api/os.html",
    "http://nodejs.org/api/path.html",
    "http://nodejs.org/api/process.html",
    "http://nodejs.org/api/punycode.html",
    "http://nodejs.org/api/querystring.html",
    "http://nodejs.org/api/readline.html",
    "http://nodejs.org/api/stdio.html",
    "http://nodejs.org/api/stream.html",
    "http://nodejs.org/api/string_decoder.html",
    "http://nodejs.org/api/timers.html",
    "http://nodejs.org/api/tls.html",
    "http://nodejs.org/api/tty.html",
    "http://nodejs.org/api/dgram.html",
    "http://nodejs.org/api/url.html",
    "http://nodejs.org/api/util.html",
    "http://nodejs.org/api/vm.html",
    "http://nodejs.org/api/zlib.html"
];

function NodeRunner(parameters, tmpDir, node_exe) {
    var self = this;
    self.runId = 0;
    self.tmpDir = tmpDir;
    self.queue = rsvp.promise();
    self.queue.fulfill(); //trigger start;
    NodeRunnerProvides.map(function (namespace) { 
        self.provides(namespace); 
    });
    this._node_exe = node_exe;
}
NodeRunner.prototype = new Runner();

NodeRunner.prototype.toString = function () {
    return "<Noderunner>";
};

NodeRunner.prototype.run = function(code, useDebugger) {
    var self = this,
        result = { passed: true, details: [] },
        runId = self.runId++;
    self.queue = self.queue.then(function () {
        var promise = rsvp.promise(),
            debugrun,
            moduleFile = path.join(self.tmpDir, "runfile_" + runId + ".js"),
            resultFile = path.join(self.tmpDir, "result_" + runId + ".json");
        code = 
            'var resultCallback = (function () {\n' +
            '    var wasCalled = false;\n' +
            '    return function resultCallback(passed, details) {\n' +
            '        if (wasCalled) {\n' +
            '            throw new Error("resultCallback should only be called once.")\n' +
            '        } else {\n' +
            '            var fs = require("fs");\n' +
            '            var result = JSON.stringify({passed: passed, details: details});\n' +
            '            fs.writeFile(' + JSON.stringify(resultFile) + ', result, "utf-8");\n' +
            '        }\n' +
            '    }\n' +
            '}());\n' +
            code;
        fs.unlink(resultFile, function () {
            fs.writeFile(moduleFile, code, "utf-8", function () {
                var nodecmd = self._node_exe + (useDebugger ? " --debug-brk " : " ");
                if (useDebugger) {
                    console.log("Running with --debug-brk");
                }
                debugrun = child_process.exec(nodecmd + moduleFile, function (p, stdout, stderr) {
                    if (stdout.length > 0) {
                        console.log(stdout);
                    }
                    if (stderr.length > 0) {
                        console.log(stderr);
                    }
                    fs.readFile(resultFile, "utf-8", function (err, content) {
                        var result;
                        if (content === undefined) {
                            result = {passed: false, details: ["No Result file generated."]};
                        }
                        else {
                            try {
                                result = JSON.parse(content);
                            } catch(e) {
                                console.log("Result to parse: '" + content + "'");
                                throw e;
                            }
                        }
                        if (!promise.isResolved()) {
                            promise.fulfill(result);
                        }
                    });
                });
                if (useDebugger) {
                    setTimeout(function () {
                        console.log("launching graphic debugger (open https://localhost:8080 in your browser)");
                        child_process.exec(".\\node_modules\\.bin\\node-inspector.cmd", function (err, stdout, stderr) {
                            if (stdout.length > 0) {
                                console.log(stdout);
                            }
                            if (stderr.length > 0) {
                                console.log(stderr);
                            }
                        });
                    }, 2000);
                }
            });
        });
        if (!useDebugger) {
            setTimeout(function () {
                if (!promise.isResolved()) {
                    if (os.platform().substr(0,3) === "win") {
                        child_process.exec("taskkill /PID " + debugrun.pid + " /F /t", function () {console.log("Tried to kill debugging session:", arguments);});
                    } else {
                        debugrun.kill("SIGTERM");
                    }
                    result.passed = false; 
                    result.details.push("timeout during test run. (file: " + moduleFile + ")"); 
                    promise.fulfill(result); 
                }
            }, 10 * 1000);
        }
        return promise;
    });
    return self.queue;
};

return NodeRunner;