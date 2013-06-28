---
expect:
    require: http://nodejs.org/api/modules.html
    _url: http://nodejs.org/api/url.html
---
---
---
// "()" baseId, relativeId:
//     baseId <- "<is string>"
//     relativeId <- "<is string>"
//     string as returnvalue
return function resolveRelativeAMDid(baseId, relativeId) {
    var url = require('url'),
        result;
    if (relativeId[0] === ".") {
        result = url.resolve(baseId, relativeId);
    } else {
        result = relativeId;
    }
    return result;
}