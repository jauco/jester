---
description: cross browser xmlhttp implementation
expects:
    optional XMLHttpRequest: http://w3c.org/XMLHttpRequest
    optional ActiveXObject: http://msdn.microsoft.com/en-us/library/ie/7sw4ddf8(v=vs.94).aspx
    optional _MSXMLHttpRequest: http://msdn.microsoft.com/en-us/library/ms537505(v=VS.85).aspx
---
---
---
function createXMLHTTPObject() {
    var XMLHttpFactories = [
        function () {return new XMLHttpRequest();},
        function () {return new ActiveXObject("MSXML2.XMLHTTP.3.0");},
    ];
    var xmlhttp, 
        i,
        e;
    for (i = 0; i < XMLHttpFactories.length; i += 1) {
        try {
            xmlhttp = XMLHttpFactories[i]();
        } catch (e) {
            continue;
        }
        break;
    }
    return xmlhttp;
}
return createXMLHTTPObject;