---
description: A shell around a launched browser that can handle selenium json wire protocol commands.
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
        var LocalSeleniumsession = factory.createModule();
        var session = new LocalSeleniumsession("http://localhost:4444/wd/hub", "Cr");

        session.sendSessionCommand("GET", "/").then(function (data) {
            expect(session._sessionId).not.toBe(undefined);
            session.dispose().then(function () {
                expect(session._sessionId).toBe(undefined);
                promise.fulfill();
            });
        });
        return promise;
    });

});
---
---
function LocalSeleniumsession(serverUrl, type) {
    var self = this;
    self._serverUrl = serverUrl;
    self._capabilities = LocalSeleniumsession.type[type];
    self.launchSession();
}

LocalSeleniumsession.prototype = new Basesession();

//https://code.google.com/p/selenium/wiki/DesiredCapabilities
LocalSeleniumsession.type = {
    "IE": {
        browserName: 'internet explorer',
        ignoreProtectedModeSettings: true
    },
    "FF": {
        browserName: "firefox",
        version: "22",
        firefox_binary: "C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe -url www.google.com"
        //firefox_profile
    },
    "Cr": {
        browserName: "chrome"
    }
};

LocalSeleniumsession.prototype.requestStart = function () {
    //ignore, the session is started in the constructor
};

LocalSeleniumsession.prototype.requestStop = function () {
    //ignore, local sessions can be up until they timeout long as we want
};

LocalSeleniumsession.prototype.toString = function () {
    return "session<local, " + this._capabilities.browserName + ">";
};

return LocalSeleniumsession;