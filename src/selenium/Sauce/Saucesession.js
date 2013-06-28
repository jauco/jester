---
description: A shell around a launched browser that can handle selenium json wire protocol commands.
expects:
    setTimeout: http://www.w3.org/TR/html5/webappapis.html#timers
    clearTimeout: http://www.w3.org/TR/html5/webappapis.html#timers
dependencies:
    Basesession: ../Basesession
    console: tools/node-wrappers/console
    test: richard/test
---
test(__module.AMDid, function (it) {
    function moduleFactory(browser) {
        return {
            createModule: function () {
                return __module.constructor(Basesession, console);
            }
        };
    }

    it("starts a browser when lauched and closes it when disposed", function (expect, promise) {
        var factory = moduleFactory();
        var Saucesession = factory.createModule();
        var session = new Saucesession("http://localhost:4445/wd/hub", "jauco", "8961ad41-9109-44f7-9855-ee0aaa56a764", "IE10", 1500);

        session.requestStart();
        session.sendSessionCommand("GET", "/").then(function (data) {
            expect(session._sessionId).not.toBe(undefined);
            session.requestStop();
            setTimeout(function () {
                expect(session._sessionId).toBe(undefined);
                promise.fulfill();
            }, 2000);
        });
        return promise;
    });
});
---
---
function Saucesession(serverUrl, username, password, type, keepAlive) {
    var self = this;
    self._serverUrl = serverUrl;
    self._capabilities = Saucesession.type[type];
    self._username = username;
    self._password = password;
    self._keepAlive = keepAlive;
}

Saucesession.prototype = new Basesession();

Saucesession.type = {
    "IE10" : {
        platform: 'Windows 8',
        browserName: 'internet explorer',
        version: '10'
    },
    //List the rest
    //iphone werkt niet heel lekker. Heeft soms zelf geen internet (wut?) de vm wil vaak niet starten.
    //Je kan dan beter met de hand een vm starten en daarmee verbinden.
    'iPhone 6': {
        platform: 'OS X 10.8',
        browserName: 'iphone',
        version: '6'
    }
};

Saucesession.prototype.requestStart = function () {
    var self = this;
    clearTimeout(self._endSessionTimer);
    if (self._sessionId === undefined) {
        self.launchSession();
    } else {
        self.sendSessionCommand("GET", "/").fail(function (error) {
            self.launchSession();
        });
    }
};

Saucesession.prototype.requestStop = function () {
    var self = this;
    self._endSessionTimer = setTimeout(function () {
        self.endSession();
    }, self._keepAlive); //shutting down a browser and relaunching it takes time
};

Saucesession.prototype.toString = function () {
    return "session<sauce, " + this._capabilities.browserName + ">";
};

return Saucesession;