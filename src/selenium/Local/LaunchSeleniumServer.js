---
description: A shell around a selenium standalone server, less options, simpler api for our use case, auto-fixes some edge cases
dependencies:
    rsvp: tools/rsvp
    child_process: tools/node-wrappers/child_process
    os: tools/node-wrappers/os
    http: tools/node-wrappers/http
    url: tools/node-wrappers/url

    test: richard/test
    createSpy: richard/createSpy
    any: richard/any
    fs: tools/node-wrappers/fs
expects:
    console: http://developer.mozilla.org/en-US/docs/DOM/console.log
    process: http://nodejs.org/api/process.html
    setTimeout: http://www.w3.org/TR/html5/webappapis.html#timers
---
test(__module.AMDid, function (it) {
    var SELENIUM_JAR_LOCATION = "D:\\Code\\jester\\selenium-server-standalone-2.19.0.jar";
    function moduleFactory(browser) {
        return {
            createModule: function () {
                return __module.constructor(rsvp, child_process, os, http, url);
            }
        };
    }

    it("will launch a selenium server on the provided port and close it when it is disposed", function (expect, promise) {
        var factory = moduleFactory();
        var createServer = factory.createModule();

        var thePort = 8089; //same port as the next unittest
        createServer(thePort, SELENIUM_JAR_LOCATION)
            .then(function (server) {
                expect(server.isRunning).toBe(true);
                if (server.isRunning) {
                    server.dispose().then(function () {
                        promise.fulfill();
                    }, function () {
                        expect("this").notToHappen();
                        promise.fulfill();
                    });
                }
            }, function () {
                expect("this").notToHappen();
            });
        return promise;
    });
    it("dispose will block until its really gone", function (expect, promise) {
        //if we start a server on the same port before the previous server is disposed
        //it won't start. so if you make these tests sync (by removing the return promise in the above test, this test will fail)
        var factory = moduleFactory();
        var createServer = factory.createModule();

        var thePort = 8089; //same port as above unittest
        createServer(thePort, SELENIUM_JAR_LOCATION)
            .then(function (server) {
                expect(server.isRunning).toBe(true);
                server.dispose().always(function () {
                    server._ping(function (isUp) {
                        expect(isUp).toBe(false);
                        promise.fulfill();
                    }, 200);
                });
            });
        return promise;
    });
    // it("also loads the chrome driver"); I don't know how to test this
    // it("also loads the IE driver"); I don't know how to test this
});
---
---
function Seleniumserver(child_process, port, command_line) {
    var self = this;
    self.serverUrl = 'http://localhost:' + port + '/wd/hub';
    self._process = child_process;
    self._command_line = command_line;

    self.isRunning = undefined;
}

Seleniumserver.prototype.dispose = function () {
    var self = this;
    if (os.platform().substr(0,3) === "win") {
        //nasty workaround for the fact that node child_processe's report the wrong PID
        child_process.exec("taskkill /PID " + self._process.pid + " /F /t");
    } else {
        self._process.kill("SIGTERM");
    }
    return self._waitFor(false).then(function () { self.isRunning = false; });
};

Seleniumserver.prototype._ping = function (callback, timeout) {
    var self = this;
    var opts = url.parse(self.serverUrl);
    opts.method = "GET";
    opts.headers = {
        "Accept": "application/json;charset=UTF-8",
        "Content-Type": "application/json;charset=UTF-8"
    };

    var request = http.get(opts, function(res) {
        if (!request.callbackWasCalled) {
            request.callbackWasCalled = true;
            callback(res.statusCode === 200);
        }
    });
    request.setTimeout(timeout, function(e) {
        request.abort();
        if (!request.callbackWasCalled) {
            request.callbackWasCalled = true;
            callback(false);
        }
    });
    request.once('error', function(e) {
        request.abort();
        if (!request.callbackWasCalled) {
            request.callbackWasCalled = true;
            callback(false);
        }
    });
    self._runningRequest = request;
    request.callbackWasCalled = false;
    return request;
};

Seleniumserver.prototype._waitFor = function (targetState) {
    var promise = rsvp.promise();
    var self = this;
    
    var currentTry = 0;
    var timeout = 200;
    var maxTryCount = 50; //200 * 50 = 10000 is roughly ten seconds
    
    function isItUpYet(isUp) {
        if (isUp === targetState) {
            self.isRunning = isUp;
            promise.fulfill();
        } else if (self.isRunning === targetState) { //an external factor caused the targetstate to be reached
            promise.fulfill();
        } else if (currentTry++ < maxTryCount) {
            self._ping(isItUpYet, timeout); //try again
        } else {
            promise.reject(); //not gonna happen
        }
    }
    self._ping(isItUpYet, timeout);
    return promise;
};

function LaunchSeleniumServer(port, jarLocation, chromedriverLocation, iedriverLocation) {
    var command_line = 'java -jar ' + JSON.stringify(jarLocation);
    if (typeof chromedriverLocation === "string") {
        command_line += ' "-Dwebdriver.chrome.driver=' + chromedriverLocation + '"';
    }
    if (typeof iedriverLocation === "string") {
        command_line += ' "-Dwebdriver.ie.driver=' + iedriverLocation + '"';
    }
    command_line += ' -port ' + port;

    var javaCommand = child_process.exec(command_line);

    var server = new Seleniumserver(javaCommand, port, command_line);
    return server._waitFor(true).then(function () { return server; });
}
return LaunchSeleniumServer;