---
description: Client side webdriver that expects a specially configured server
expects:
    window: https://developer.mozilla.org/en-US/docs/Web/API/window
    console: https://developer.mozilla.org/en-US/docs/Web/API/window.console
dependencies:
    createXMLHTTPObject: tools/createXMLHTTPObject
    global: tools/global
    JSON: tools/json
    test: richard/test
---
test(__module.AMDid, function (it) {
    it("can do a sendKeys", function (expect) {
        window.onload = function () {
            window.document.body.innerHTML = "<input>";
            __module.constructor(createXMLHTTPObject, global, JSON);
            var w = new (window.Webdriver)();
            window.document.body.childNodes[0].addEventListener("change", function (e) {
                console.log(e);
            });
            w.sendKeysToElement(window.document.body.childNodes[0], "foo", function () {
                window.document.body.childNodes[0].blur();
            });
        };

    });
});
---
---
var seleniumProxyUrl = "";
function Webdriver() {
    this._proxyUrl = seleniumProxyUrl;
}

Webdriver.data = {};

Webdriver.prototype._xhr = function (verb, url, body, callback) {
    var req = createXMLHTTPObject();
    req.open("POST", this._proxyUrl, true);
    req.setRequestHeader("Content-type","application/json");

    req.send(JSON.stringify({method: verb, path: url, data: body}));

    req.onreadystatechange = function () {
        var res;
        if (req.readyState === 4){ //request is done
            if (req.status === 200) {
                res = JSON.parse(req.responseText);
                if (res.statusCode >= 200 && res.statusCode <= 299) {
                    callback(undefined, res.body);
                } 
            } else {
                callback(res, undefined);
            }
        }
    };
};

Webdriver.prototype.keys = {
    "NULL": "\uE000",
    "Cancel": "\uE001",
    "Help": "\uE002",
    "Backspace": "\uE003",
    "Tab": "\uE004",
    "Clear": "\uE005",
    "Enter": "\uE006",
    "Numpad enter": "\uE007",
    "Shift": "\uE008",
    "Control": "\uE009",
    "Alt": "\uE00A",
    "Pause": "\uE00B",
    "Escape": "\uE00C",
    "Space": "\uE00D",
    "Pageup": "\uE00E",
    "Pagedown": "\uE00F",
    "End": "\uE010",
    "Home": "\uE011",
    "Left arrow": "\uE012",
    "Up arrow": "\uE013",
    "Right arrow": "\uE014",
    "Down arrow": "\uE015",
    "Insert": "\uE016",
    "Delete": "\uE017",
    "Semicolon": "\uE018",
    "Equals": "\uE019",
    "Numpad 0": "\uE01A",
    "Numpad 1": "\uE01B",
    "Numpad 2": "\uE01C",
    "Numpad 3": "\uE01D",
    "Numpad 4": "\uE01E",
    "Numpad 5": "\uE01F",
    "Numpad 6": "\uE020",
    "Numpad 7": "\uE021",
    "Numpad 8": "\uE022",
    "Numpad 9": "\uE023",
    "Multiply": "\uE024",
    "Add": "\uE025",
    "Separator": "\uE026",
    "Subtract": "\uE027",
    "Decimal": "\uE028",
    "Divide": "\uE029",

    "F1": "\uE031",
    "F2": "\uE032",
    "F3": "\uE033",
    "F4": "\uE034",
    "F5": "\uE035",
    "F6": "\uE036",
    "F7": "\uE037",
    "F8": "\uE038",
    "F9": "\uE039",
    "F10": "\uE03A",
    "F11": "\uE03B",
    "F12": "\uE03C",
    "Command/Meta": "\uE03D"
};

Webdriver.prototype._getSeleniumHandle = function (domElement, callback) {
    window.Webdriver.data.domElement = domElement;
    this._xhr(
        "POST", 
        "/execute", 
        { 
            script: "var top = window; while(!top.hasOwnProperty('Webdriver') && top !== window.parent) { top = window.parent } return top.Webdriver.data.domElement;", 
            args: [] 
        }, 
        function (err, result) {
            callback(err, result ? result.value.ELEMENT : undefined);
        }
    );
};

Webdriver.prototype.sendKeysToElement = function (domElement, text, callback) {
    var self = this;
    this._getSeleniumHandle(domElement, function(err, handle){
        var data = [], 
            i;
        for (i = 0; i < text.length; i += 1){ //turn strings into an array
            data.push(text[i]);
        }
        self._xhr(
            "POST", 
            "/element/" + handle + "/value", 
            {value: data}, 
            callback
        );
    });
};

Webdriver.prototype.clickOnElement = function (domElement, callback) {
    var self = this;
    var element = this._getSeleniumHandle(domElement, function(err, handle){
        self._xhr(
            "POST", 
            "/element/" + handle + "/click", 
            undefined,
            callback
        );
    });
};

Webdriver.prototype.moveMouseToElement = function (domElement, xOffset, yOffset, callback) {
    var self = this;
    var element = this._getSeleniumHandle(domElement, function(err, handle){
        self._xhr(
            "POST", 
            "/moveto", 
            {
                element: handle,
                xoffset: xOffset,
                yoffset: yOffset
            },
            callback
        );
    });
};

Webdriver.prototype.acceptAlert = function (callback) {
    this._xhr("POST", "/accept_alert", undefined, callback);
};
Webdriver.prototype.dismissAlert = function (callback) {
    this._xhr("POST", "/dismiss_alert", undefined, callback);
};

Webdriver.prototype.moveMouse = function (xOffset, yOffset, callback) {
    this._xhr(
        "POST", 
        "/moveto", 
        {
            xoffset: xOffset,
            yoffset: yOffset
        },
        callback
    );
};

Webdriver.prototype.clickMouse = function (button, doubleclick, callback) {
    var buttons = {
        "left": 0,
        "middle": 1,
        "right": 2
    };
    var clicktype = doubleclick ? "doubleclick" : "click";
    this._xhr(
        "POST", 
        "/" + clicktype, 
        {
            button: buttons[button]
        },
        callback
    );
};

Webdriver.prototype.buttonDown = function (button, callback) {
    var self = this;
    var buttons = {
        "left": 0,
        "middle": 1,
        "right": 2
    };
    self._xhr(
        "POST", 
        "/buttondown", 
        {
            button: buttons[button]
        },
        function () {
            function releaser(callback) {
                this._xhr("POST", "/buttonup", {button: buttons[button]}, callback);
            }
            callback(releaser);
        }
    );
};

/*
To implement when I have access to a proper testing session
/touch/click
/touch/down
/touch/up
/touch/move
/touch/scroll
/touch/scroll
/touch/doubleclick
/touch/longclick
/touch/flick
/touch/flick
*/

Webdriver.prototype.switchTo = function (frameId, callback) {
    this._xhr(
        "POST", 
        "/frame/", 
        { id: frameId }, 
        callback
    );
};

global.Webdriver = Webdriver;