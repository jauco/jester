---
description: A method that will tell you if two values have equal contents, works recursively
dependencies:
    objLoop: tools/objLoop
    test: ../non-recursetest
---
test(__module.AMDid, function (handles, spec) {
    var equals = __module.constructor(objLoop);

    handles("empty object", function (expect) {
        expect(equals({}, {}).passed).toBe(true);
    });
    handles("1 property", function (expect) {
        expect(equals({foo:1}, {foo:1}).passed).toBe(true);
        expect(equals({foo:1}, {}).details).toEqual({".foo": [1, undefined]});
    });
    handles("recursive", function (expect) {
        expect(equals({foo:{bar:1}}, {foo:{bar:2}}).details).toEqual({".foo.bar": [1,2]});
    });
    handles("recursive", function (expect) {
        expect(equals({foo:{}}, {foo:{bar:2}}).details).toEqual({".foo.bar":[undefined, 2]});
    });
});
---
---
var equals;
function objectsAreEqual(actual, expected, actualMayHaveMoreProperties, prefix, details) {
    var key;
    if (actual === expected) {
        return;
    }
    objLoop(expected, function (key, value) {
        equals(actual[key], value, actualMayHaveMoreProperties, prefix + "." + key, details);
    });
    if (!actualMayHaveMoreProperties) {
        objLoop(actual, function (key, value) {
            if (!expected.hasOwnProperty(key)) { //if it wasn't defined, we have checked it at the loop above
                details[prefix + "." + key] = [value, undefined];
            }
        });
    }
}

equals = function (actual, expected, actualMayHaveMoreProperties, prefix, details) {
    var isEqual = true,
        message;
    if (actual !== expected) {
        if (expected && expected.jasmineMatches) {
            isEqual = expected.jasmineMatches(actual);
        } else if (actual instanceof Date && expected instanceof Date) {
            isEqual = actual.getTime() === expected.getTime();
        } else if ((actual instanceof String || typeof actual === "string") && (expected instanceof String || typeof expected === "string")) {
            //make sure equals("foo", new String("foo")) => true
            isEqual = (actual.valueOf() === expected.valueOf());
        } else if ((actual instanceof Number || typeof actual === "number") && (expected instanceof Number || typeof expected === "number")) {
            isEqual = (actual.valueOf() === expected.valueOf());
        } else if ((actual instanceof Boolean || typeof actual === "boolean") && (expected instanceof Boolean || typeof expected === "boolean")) {
            isEqual = (actual.valueOf() === expected.valueOf());
        } else if (typeof actual === "object" && typeof expected === "object") {
            objectsAreEqual(actual, expected, actualMayHaveMoreProperties, prefix, details);
        } else {
            isEqual = false;
        }
    }
    if (!isEqual) {
        details[prefix] = [actual, expected];
    }
};

return function (actual, expected, actualMayHaveMoreProperties) {
    var details = {};
    equals(actual, expected, actualMayHaveMoreProperties, "", details);
    return {
        passed: Object.keys(details).length === 0, 
        details: details
    };
};