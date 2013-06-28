---
description: Client side webdriver that expects a specially configured server
expects:
    window: http://dom/window
dependencies:
    createXMLHTTPObject: tools/createXMLHTTPObject
    global: tools/global
---
---
---
var seleniumProxyUrl = "";
function Webdriver() {
    this._procyUrl = seleniumProxyUrl;
}

Webdriver.data = {};

Webdriver.prototype._xhr = function (verb, url, body, callback) {
    var req = createXMLHTTPObject();
    
    req.open("POST", this._procyUrl, true);
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
        "execute", 
        { 
            script: "var top = window; while(!top.hasOwnProperty('Webdriver') && top !== window.parent) { top = window.parent } return top.Webdriver.data.domElement;", 
            args: [] 
        }, 
        function (err, result) {
            callback(err, result ? result.value.ELEMENT : undefined);
        }
    );
};

Webdriver.prototype.sendKeys = function (domElement, text, callback) {
    var self = this;
    this._getSeleniumHandle(domElement, function(handle){
        var data = [], 
            i;
        for (i = 0; i < text.length; i += 1){ //turn strings into an array
            data.push(text[i]);
        }
        self._xhr(
            "POST", 
            "element/" + handle + "/value", 
            {value: data}, 
            callback
        );
    });
};

Webdriver.prototype.click = function (domElement, callback) {
    var self = this;
    var element = this._getSeleniumHandle(domElement, function(handle){
        self._xhr(
            "POST", 
            "element/" + handle + "/click", 
            undefined,
            callback
        );
    });
};

Webdriver.prototype.switchTo = function (frameId, callback) {
    this._xhr(
        "POST", 
        "frame/", 
        { id: frameId }, 
        callback
    );
};

global.Webdriver = Webdriver;