---
Description: A runner that will connect to a selenium server and execute the script on a browser
dependencies:
    Runner: ../Runner
    RequestHandler: tools/requestHandler
    objLoop: tools/objLoop
    rsvp: tools/rsvp
    test: richard/test
---
test(__module.AMDid, function (it, spec) {
    it("will send the command to selenium to request the test page");
    it("will provide a test page that requests the test code");
    it("will provide the test code");
});
---
---
function resultCallerCode(postUrl) {
    return "" +
        //copy seleniumResultcallback code here
        '(function() {\n' +
        '"use strict";\n' +
        'var $tools$47createXMLHTTPObject = (function () {\n' +
        '\n' +
        'function createXMLHTTPObject() {\n' +
        '    var XMLHttpFactories = [\n' +
        '        function () {return new XMLHttpRequest();},\n' +
        '        function () {return new ActiveXObject("MSXML2.XMLHTTP.3.0");},\n' +
        '    ];\n' +
        '    var xmlhttp, \n' +
        '        i,\n' +
        '        e;\n' +
        '    for (i = 0; i < XMLHttpFactories.length; i += 1) {\n' +
        '        try {\n' +
        '            xmlhttp = XMLHttpFactories[i]();\n' +
        '        } catch (e) {\n' +
        '            continue;\n' +
        '        }\n' +
        '        break;\n' +
        '    }\n' +
        '    return xmlhttp;\n' +
        '}\n' +
        'return createXMLHTTPObject;\n' +
        '}());\n' +
        'var $tess$47runners$47Selenium$47seleniumResultcallback = (function (createXMLHTTPObject) {\n' +
        '\n' +
        'var postUrl = ' + JSON.stringify(postUrl) + ';\n' +
        '\n' +
        'function finishRun(passed, details) {\n' +
        '    var req = createXMLHTTPObject();\n' +
        '    req.open("POST", postUrl, true);\n' +
        '    req.setRequestHeader("Content-type","application/json");\n' +
        '    req.send(JSON.stringify({passed: passed, details: details}));\n' +
        '}\n' +
        '\n' +
        'window.onerror = function(errorMsg, url, lineNumber) {\n' +
        '    url = url.substr((window.location.protocol+"//"+window.location.host+"/runtest").length);\n' +
        '    finishRun({"run error": [url, lineNumber, errorMsg]});\n' +
        '};\n' +
        '\n' +
        'window.resultCallback = finishRun;\n' +
        '\n' +
        '}($tools$47createXMLHTTPObject));\n' +
        '\n' +
        '}());';
}

function compiledWebdriverCode(seleniumProxyUrl) {
    return "" +
        //copy webdriver code here
        '(function() {\n' +
        '"use strict";\n' +
        'var $tools$47createXMLHTTPObject = (function () {\n' +
        '\n' +
        'function createXMLHTTPObject() {\n' +
        '    var XMLHttpFactories = [\n' +
        '        function () {return new XMLHttpRequest();},\n' +
        '        function () {return new ActiveXObject("MSXML2.XMLHTTP.3.0");},\n' +
        '    ];\n' +
        '    var xmlhttp, \n' +
        '        i,\n' +
        '        e;\n' +
        '    for (i = 0; i < XMLHttpFactories.length; i += 1) {\n' +
        '        try {\n' +
        '            xmlhttp = XMLHttpFactories[i]();\n' +
        '        } catch (e) {\n' +
        '            continue;\n' +
        '        }\n' +
        '        break;\n' +
        '    }\n' +
        '    return xmlhttp;\n' +
        '}\n' +
        'return createXMLHTTPObject;\n' +
        '}());\n' +
        'var $tools$47global = (function () {\n' +
        '\n' +
        '/*jshint evil:true*/\n' +
        '\n' +
        '// To be cross compatible across different js platforms you need a way to access the global object (i.e. the window\n' +
        '// object in the browser). This can usually be achieved by returning "this" from a function that is not called as a \n' +
        '// method. \n' +
        '\n' +
        '// Strict mode, however, throws an error when you do this. Calling the Function constructor with eval-able code gets \n' +
        '// around this because that code is then automatically somewhat outside \'use strict\'.\n' +
        '\n' +
        '// yes this is obscure and hackish, hence the long explanation and the jshint pragma.\n' +
        'return new Function(\'return this\')();\n' +
        '}());\n' +
        'var $tess$47runners$47Selenium$47clientsideWebdriver = (function (createXMLHTTPObject,global) {\n' +
        '\n' +
        'var seleniumProxyUrl = ' + JSON.stringify(seleniumProxyUrl) + ';\n' +
        'function Webdriver() {\n' +
        '    this._procyUrl = seleniumProxyUrl;\n' +
        '}\n' +
        '\n' +
        'Webdriver.data = {};\n' +
        '\n' +
        'Webdriver.prototype._xhr = function (verb, url, body, callback) {\n' +
        '    var req = createXMLHTTPObject();\n' +
        '    \n' +
        '    req.open("POST", this._procyUrl, true);\n' +
        '    req.setRequestHeader("Content-type","application/json");\n' +
        '\n' +
        '    req.send(JSON.stringify({method: verb, path: url, data: body}));\n' +
        '\n' +
        '    req.onreadystatechange = function () {\n' +
        '        var res;\n' +
        '        if (req.readyState === 4){ //request is done\n' +
        '            if (req.status === 200) {\n' +
        '                res = JSON.parse(req.responseText);\n' +
        '                if (res.statusCode >= 200 && res.statusCode <= 299) {\n' +
        '                    callback(undefined, res.body);\n' +
        '                } \n' +
        '            } else {\n' +
        '                callback(res, undefined);\n' +
        '            }\n' +
        '        }\n' +
        '    };\n' +
        '};\n' +
        '\n' +
        'Webdriver.prototype.keys = {\n' +
        '    "NULL": "\\uE000",\n' +
        '    "Cancel": "\\uE001",\n' +
        '    "Help": "\\uE002",\n' +
        '    "Backspace": "\\uE003",\n' +
        '    "Tab": "\\uE004",\n' +
        '    "Clear": "\\uE005",\n' +
        '    "Enter": "\\uE006",\n' +
        '    "Numpad enter": "\\uE007",\n' +
        '    "Shift": "\\uE008",\n' +
        '    "Control": "\\uE009",\n' +
        '    "Alt": "\\uE00A",\n' +
        '    "Pause": "\\uE00B",\n' +
        '    "Escape": "\\uE00C",\n' +
        '    "Space": "\\uE00D",\n' +
        '    "Pageup": "\\uE00E",\n' +
        '    "Pagedown": "\\uE00F",\n' +
        '    "End": "\\uE010",\n' +
        '    "Home": "\\uE011",\n' +
        '    "Left arrow": "\\uE012",\n' +
        '    "Up arrow": "\\uE013",\n' +
        '    "Right arrow": "\\uE014",\n' +
        '    "Down arrow": "\\uE015",\n' +
        '    "Insert": "\\uE016",\n' +
        '    "Delete": "\\uE017",\n' +
        '    "Semicolon": "\\uE018",\n' +
        '    "Equals": "\\uE019",\n' +
        '    "Numpad 0": "\\uE01A",\n' +
        '    "Numpad 1": "\\uE01B",\n' +
        '    "Numpad 2": "\\uE01C",\n' +
        '    "Numpad 3": "\\uE01D",\n' +
        '    "Numpad 4": "\\uE01E",\n' +
        '    "Numpad 5": "\\uE01F",\n' +
        '    "Numpad 6": "\\uE020",\n' +
        '    "Numpad 7": "\\uE021",\n' +
        '    "Numpad 8": "\\uE022",\n' +
        '    "Numpad 9": "\\uE023",\n' +
        '    "Multiply": "\\uE024",\n' +
        '    "Add": "\\uE025",\n' +
        '    "Separator": "\\uE026",\n' +
        '    "Subtract": "\\uE027",\n' +
        '    "Decimal": "\\uE028",\n' +
        '    "Divide": "\\uE029",\n' +
        '\n' +
        '    "F1": "\\uE031",\n' +
        '    "F2": "\\uE032",\n' +
        '    "F3": "\\uE033",\n' +
        '    "F4": "\\uE034",\n' +
        '    "F5": "\\uE035",\n' +
        '    "F6": "\\uE036",\n' +
        '    "F7": "\\uE037",\n' +
        '    "F8": "\\uE038",\n' +
        '    "F9": "\\uE039",\n' +
        '    "F10": "\\uE03A",\n' +
        '    "F11": "\\uE03B",\n' +
        '    "F12": "\\uE03C",\n' +
        '    "Command/Meta": "\\uE03D"\n' +
        '};\n' +
        '\n' +
        'Webdriver.prototype._getSeleniumHandle = function (domElement, callback) {\n' +
        '    window.Webdriver.data.domElement = domElement;\n' +
        '    this._xhr(\n' +
        '        "POST", \n' +
        '        "execute", \n' +
        '        { \n' +
        '            script: "var top = window; while(!top.hasOwnProperty(\'Webdriver\') && top !== window.parent) { top = window.parent } return top.Webdriver.data.domElement;", \n' +
        '            args: [] \n' +
        '        }, \n' +
        '        function (err, result) {\n' +
        '            callback(err, result ? result.value.ELEMENT : undefined);\n' +
        '        }\n' +
        '    );\n' +
        '};\n' +
        '\n' +
        'Webdriver.prototype.sendKeys = function (domElement, text, callback) {\n' +
        '    var self = this;\n' +
        '    this._getSeleniumHandle(domElement, function(handle){\n' +
        '        var data = [], \n' +
        '            i;\n' +
        '        for (i = 0; i < text.length; i += 1){ //turn strings into an array\n' +
        '            data.push(text[i]);\n' +
        '        }\n' +
        '        self._xhr(\n' +
        '            "POST", \n' +
        '            "element/" + handle + "/value", \n' +
        '            {value: data}, \n' +
        '            callback\n' +
        '        );\n' +
        '    });\n' +
        '};\n' +
        '\n' +
        'Webdriver.prototype.click = function (domElement, callback) {\n' +
        '    var self = this;\n' +
        '    var element = this._getSeleniumHandle(domElement, function(handle){\n' +
        '        self._xhr(\n' +
        '            "POST", \n' +
        '            "element/" + handle + "/click", \n' +
        '            undefined,\n' +
        '            callback\n' +
        '        );\n' +
        '    });\n' +
        '};\n' +
        '\n' +
        'Webdriver.prototype.switchTo = function (frameId, callback) {\n' +
        '    this._xhr(\n' +
        '        "POST", \n' +
        '        "frame/", \n' +
        '        { id: frameId }, \n' +
        '        callback\n' +
        '    );\n' +
        '};\n' +
        '\n' +
        'global.Webdriver = Webdriver;\n' +
        '}($tools$47createXMLHTTPObject,$tools$47global));\n' +
        '\n' +
        '}());\n';
}

function SeleniumRunner(session, kickoffPrefix) {
    var id,
        self = this;

    self.queue = rsvp.promise();
    self.queue.fulfill(); //trigger start;

    self.runs = {};

    self.provides("http://jauco.nl/applications/jester/1/webdriver");
    self.provides("http://jauco.nl/applications/jester/1/resultCallback");
    self.provides("http://developer.mozilla.org/en-US/docs/DOM/console.log");

    self._session = session;
    self._kickoffPrefix = kickoffPrefix;

    self._requestHandler = new RequestHandler(
        ["sendResults", "requestData"], {

        "/run/{*}": function testPage(runId, query, sendResults, requestData) {
            var generator = self.testPageGenerator,
                resultCallerUrl = this.urlFor["resultCaller"](runId),
                clientsideWebdriverUrl = this.urlFor["webdriverCode"](),
                codeUrl = this.urlFor["code"](runId),
                
                result = generator(runId, resultCallerUrl, clientsideWebdriverUrl, codeUrl);
            sendResults(result);
        },

        "/run/{*}/code.js": function code(runId, query, sendResults, requestData) {
            sendResults(self.runs[runId].code);
        },

        "/run/{*}/resultCaller.js": function resultCaller(runId, query, sendResults, requestData) {
            sendResults(resultCallerCode(this.urlFor["finish"](runId)));
        },

        "/run/{*} (POST)": function finish(runId, query, sendResults, requestData) {
            var result = {};
            if (requestData) {
                result = JSON.parse(requestData);
            }
            sendResults("");
            self._session.requestStop();
            self.runs[runId].promise.fulfill(result);
        },

        "/webdriver.js": function webdriverCode(query, sendResults, requestData) {
            sendResults(compiledWebdriverCode(this.urlFor["webdriverCall"]()));
        },

        "/webdriver (POST)": function webdriverCall(query, sendResults, requestData) {
            var webDriverRequest = {};
            if (requestData) {
                webDriverRequest = JSON.parse(requestData);
            }
            self._session
                .sendWireCommand(webDriverRequest.method, webDriverRequest.path, webDriverRequest.data)
                .always(function (promise) {
                    sendResults(JSON.stringify(promise.valueOf()));
                });
        }
    });
}

SeleniumRunner.prototype = new Runner();

SeleniumRunner.prototype.handle = function () {
    this._requestHandler.handle.apply(this._requestHandler, arguments);
};

var id = 0;
SeleniumRunner.prototype.run = function (code, useDebugger) {
    var self = this;
    var runId = id++;
    self.runs[runId] = {
        code: code,
        useDebugger: useDebugger,
        promise: rsvp.promise()
    };
    var thisRunPromise = self.queue.then(function () {
        self._session.requestStart();
        self._session.openUrl(self._kickoffPrefix + self._requestHandler.urlFor["testPage"](runId), useDebugger);
        return self.runs[runId].promise;
    });

    self.queue = thisRunPromise;
    
    return thisRunPromise;
};

SeleniumRunner.prototype.testPageGenerator = function testPageGenerator(runId, resultCallerUrl, webdriverUrl, codeUrl) {
    return "<html>\n" +
        "<script src='" + resultCallerUrl + "'></script>\n" +
        "<script src='" + webdriverUrl + "'></script>\n" + 
        "<script src='" + codeUrl + "'></script>\n" +
        "</html>";
};

SeleniumRunner.prototype.toString = function () {
    return "<Seleniumrunner: " + this._session + ">";
};

return SeleniumRunner;