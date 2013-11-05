---
description: the resultCallback implementation for the selenium runner
dependencies:
    createXMLHTTPObject: tools/createXMLHTTPObject
    JSON: tools/json
expects:
    window: //window
---
---
---
var postUrl = "";

function finishRun(passed, details) {
    var req = createXMLHTTPObject();
    req.open("POST", postUrl, true);
    req.setRequestHeader("Content-type","application/json");
    req.send(JSON.stringify({passed: passed, details: details}));
}

window.onerror = function(errorMsg, url, lineNumber, error) {
    var details;
    if (error) {
        details = error.stack;
    } else {
        details = errorMsg + ' at line ' + lineNumber + ' at ' + url;
    }
    finishRun(false, [details]);
};

window.resultCallback = finishRun;