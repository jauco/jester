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

window.onerror = function(errorMsg, url, lineNumber) {
    url = url.substr((window.location.protocol+"//"+window.location.host+"/runtest").length);
    finishRun({"run error": [url, lineNumber, errorMsg]});
};

window.resultCallback = finishRun;
