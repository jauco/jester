---
dependencies:
    jshint: ./jshint
    map: tools/map
    test: richard/test
    createSpy: richard/createSpy
    any: richard/any
---
test(__module.AMDid, function (it) {
    function init() {
        var deps = {
            jshint: createSpy("jshint", true),
            construct: function () {
                return __module.constructor(deps.jshint, map);
            }
        };
        return deps;
    }
    it("calls jshint with the same arguments", function (expect) {
        var deps = init();
        var linter = deps.construct();

        linter("arg1", "arg2", "arg3");

        expect(deps.jshint).toHaveBeenCalledWith("arg1", "arg2", "arg3");
    });
    it("turns jshint errors into a string that fits the standard testresult format", function (expect) {
        var deps = init();
        var linter = deps.construct();

        deps.jshint.result = false;
        deps.jshint.errors = [ 
            {
                code: '<code>',
                evidence: '<js code>',
                line: "<lineNo>",
                character: "<charNo>",
                reason: '<reason>'
            }
        ];

        var result = linter();

        expect(result).toEqual({passed: false, details: ["<lineNo>,<charNo>: <js code>\n                   <reason> (<code>)"]});
    });
});
---
---
return function (code, settings, globals) {
    var testResult = jshint(code, settings, globals);
    var errors = testResult ? [] : jshint.errors;
    errors = map(errors, function (error) {
        if (error) {
            var location = error.line + "," + error.character + ": ";
            var indent = new Array(location.length).join(" ") + " ";
            return location + error.evidence + "\n" + indent + error.reason + " (" + error.code + ")";
        }
    });

    return {
        passed: testResult,
        details: errors
    };
};