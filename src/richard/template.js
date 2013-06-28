---
dependencies:
    equals: ./expect/equals
---
---
---
return function template(obj) {
    return {
        jasmineMatches: function (actual) {
            return equals(actual, obj, true).passed;
        },
        toString: function () {
            return "<template: " + JSON.stringify(obj) + ">";
        }
    };
};
// this.message = function (req) {
//     if (this.isNot) {
//         return "actual did have " + prettyPrint(expected);
//     }
//     var result = "differences found:\n";
//     objLoop(equal.details, function (key, value) {
//         result += "  '" + key + "' is " + prettyPrint(value[0]) + " instead of " + prettyPrint(value[1]) + ".\n";
//     })
//     return result;
// }
