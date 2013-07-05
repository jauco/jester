---
description: A shell around a launched browser that can handle selenium json wire protocol commands.
dependencies:
    test: richard/test
    rsvp: tools/rsvp
    console: tools/node-wrappers/console

expects:
    require: http://nodejs.org/api/modules.html
    _request: https://github.com/mikeal/request
---
test(__module.AMDid, function (it) {
    //Basesession tests
    it("formats a command into a correct request using the provided server information");
    it("queues commands");

    //edge cases
    it("throws an error if the server is no longer online");
    it("throws an error if the sendWireCommand does not start with a slash");
    it("always exectutes the next action in the queue (even if the previous action returned an error)");
    it("rejects the sendWireCommand promise if something fails");

    //bugfixes
    it("can handle selenium responses that contain NULL characters");
    it("Will explicitly request UTF8 json and provide UTF8 json so selenium doesn't bork");
});
---
---
var request = require("request");

function promiseQueue() {
    var self = this;
    self._promise = rsvp.promise();
    self._promise.fulfill();
}

promiseQueue.prototype.push = function (toCall) {
    var self = this;
    self._promise = self._promise.always(toCall);
    return self._promise;
};

function Basesession() {
    // You should provide:
    //  - _serverUrl (string _not_ ending in a slash)
    //  - _username (if required by the server)
    //  - _password (if required by the server)
    //  - _messageQueue (a promise that will resolve (usually the result of the first call to sendRequest))
    //  - _sessionId (should be available when the first .then of the _messageQueue fires)
    //  - requestStart implementation
    //  - requestStop implementation
    this._messageQueue = new promiseQueue();
}

Basesession.prototype.sendSessionCommand = function (verb, path, data) {
    var self = this;
    if (path.substr(0,1) !== "/") {
        throw new Error("path must start with a slash");
    }
    return self._messageQueue.push(function () { 
        var url = self._serverUrl + "/session/" + self._sessionId + path;
        return self._sendRequest(verb, url, data);
    });
};

Basesession.prototype.openUrl = function (url, useDebugger) {
    this.sendSessionCommand("POST", "/url", {url: url});
    //implement commands to open a debug console if needed
};

Basesession.prototype.dispose = function () {
    return this.endSession();
};

Basesession.prototype._sendRequest = function (verb, url, data) {
    var self = this;
    var result = rsvp.promise();
    var requestData = {
        url: url,
        method: verb, 
        headers: {
            "Accept": "application/json;charset=UTF-8",
            "Content-Type": "application/json;charset=UTF-8"
        },
        body: data === undefined ? undefined : JSON.stringify(data),
        encoding: "utf8",
        followAllRedirects: true
    };
    if (self._username && self._password) {
        requestData.auth = {
            user: self._username,
            pass: self._password,
            sendImmediately: false //so we only set the auth header if the server asks us to
        };
    }
    request(requestData, function (error, res, body) {
        if (error) {
            result.fulfill({
                statusCode: res ? res.statusCode : undefined,
                body: body,
                headers: res ? res.headers : undefined
            });
        } else  {
            if (body) {
                body = body.split("\u0000").join(""); //remove null characters
                try {
                    body = JSON.parse(body);
                } catch(e) {
                    result.fulfill({
                        statusCode: 599,
                        body: e.stack,
                        headers: {}
                    });
                }
            }
            result.fulfill({
                statusCode: res.statusCode,
                body: body,
                headers: res.headers
            });
        }
    });
    return result;
};

Basesession.prototype.launchSession = function () {
    var self = this;
    self._messageQueue.push(function () {
        var promise = self._sendRequest("POST", self._serverUrl + "/session", { desiredCapabilities: self._capabilities })
            .then(function (response) {
                self._sessionId = response.body.sessionId; 
            });
        return promise;
    });
};

Basesession.prototype.endSession = function () {
    var self = this;

    return self.sendSessionCommand("DELETE", "/").always(function () {
        self._sessionId = undefined;
    });
};

return Basesession;