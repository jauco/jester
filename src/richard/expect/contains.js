---
dependencies:
    equals: ./equals
---
---
---
/* jshint -W018 */ //!! converts something to an actual boolean value
return function contains(haystack, needle) {
    var i;
    if (typeof haystack.indexOf === "function") {
        return !!(haystack.indexOf(needle) > -1); //!! converts to an actual boolean value
    }
    for (i = 0; i < haystack.length; i += 1) {
        if (equals(haystack[i], needle).passed) {
            return true;
        }
    }
    return false;
};