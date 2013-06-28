---
expects:
    console: http://developer.mozilla.org/en-US/docs/DOM/console.log
dependencies:
    contains: ./contains
    global: tools/global
    test: richard/non-recursetest
---
test(__module.AMDid, function (it, spec) {
    var prettyPrint = __module.constructor(contains, global);
    spec("domain tests", function (it) {
        it("handles circular references", function (expect) {
            var obj = {};
            obj.prop = obj;
            var result = prettyPrint(obj);
            expect(result).toEqual("{prop: <circular reference: Object>}");
        });
    });
    spec("Edge case tests", function (it) {
        it("handles printing the same object twice", function (expect) {
            var obj = {};
            var result = prettyPrint([obj, obj]);
            expect(result).toEqual("[{}, {}]");
        });
    });
});
---
---
//max complexity higher because it's a flat case-switch lost
/* jshint maxcomplexity: 20 */
//HTMLElement is checked for using typeof, this won't error if the variable isn't defined 
/* globals HTMLElement */
function prettyPrint_recursive(value, nestLevel, printedObjects) {
    var result,
        i;
    if (nestLevel > 20) {
        result = "<...>";
    } else if (typeof value === "undefined") {
        result = 'undefined';
    } else if (value === null) {
        result = 'null';
    } else if (value === global) {
        result = '<global>';
    } else if (typeof value === 'string' || value instanceof String) {
        result = JSON.stringify(value);
    } else if (value instanceof Function && !value.hasOwnProperty("toString")) {
        result = 'function ' + value.name + "() { ... }";
    } else if (typeof HTMLElement !== "undefined" && value instanceof HTMLElement) {
        result = value.outerHTML;
    } else if (value instanceof Date) {
        result = 'Date(' + value.toLocaleDateString() + " " + value.toLocaleTimeString() + ')';
    } else if (contains(printedObjects, value)) {
        result = '<circular reference: ' + (value instanceof Array ? 'Array' : 'Object') + '>';
    } else if (value instanceof Array) {
        result = "[";
        for (i = 0; i < value.length; i += 1) {
            if (i > 0) {
                result += ', ';
            }
            result += prettyPrint_recursive(value[i], nestLevel + 1, printedObjects.concat([value]));
        }
        result += "]";
    } else if (typeof value === 'object') {
        if (value.hasOwnProperty("toString") || (value.constructor !== Object && value.constructor.prototype.hasOwnProperty("toString"))) {
            result = value.toString();
        } else {
            var keys = Object.keys(value);
            result = "{";
            for (i = 0; i < keys.length; i += 1) {
                if (i > 0) {
                    result += ', ';
                }
                result += keys[i] + ": ";
                if (typeof value.__lookupGetter__ === "function" && value.__lookupGetter__(keys[i])) {
                    result += "<getter>";
                }
                result += prettyPrint_recursive(value[keys[i]], nestLevel + 1, printedObjects.concat([value]));
            }
            result += "}";
        }
    } else {
        result = value.toString();
    }
    return result;
}
function prettyPrint(value) {
    return prettyPrint_recursive(value, 0, []);
}
return prettyPrint;