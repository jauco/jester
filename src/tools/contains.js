---
description: wrapper for indexOf > -1 that also works if the iterable has no indexOf implementation
---
---
---
return function contains(haystack, needle) {
    /* jshint -W018 */ //!! converts something to an actual boolean value
    var i;
    if (typeof haystack.indexOf === "function") {
        return !!(haystack.indexOf(needle) > -1); //!! converts to an actual boolean value
    }
    for (i = 0; i < haystack.length; i += 1) {
        if (haystack[i] === needle) {
            return true;
        }
    }
    return false;
};
