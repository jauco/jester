---
description: runs the linter
dependencies:
    map: tools/map
    rsvp: tools/rsvp
    objLoop: tools/objLoop

    linter: douglas/main

    test: richard/test
    createSpy: richard/createSpy
---
test(__module.AMDid, function (it) {
    function moduleFactory() {
        return {
            linter: createSpy("linter", {}),
            createModule: function () {
                return __module.constructor(map, rsvp, objLoop, this.linter);
            }
        };
    }

    it("runs lint", function (expect) {
        var factory = moduleFactory();
        var linter = factory.createModule();

        linter("foo", {"foo": { expectations: {}, dependencyVariables: [] }}, {}, function () {});

        expect(factory.linter).toHaveBeenCalled();
    });

});
---
---
function reportResult(result, Module, writeLog) {
    if (result.passed) {
        writeLog(1, "No lint found in " + Module);
    } else {
        writeLog(1, "Lint found in " + Module);
        writeLog(2, result.details);
    }
}

function runLint(AMDid, snapshot, lintpreferences, writeLog) {
    var promise = rsvp.promise();
    var module = snapshot[AMDid];
    
    writeLog(0, "Running linter...");
    //module expectations are in scope
    var predefinedVariables = objLoop(module.expectations, function (key, value) {
        return false; //false indicates to jsHint that you may not assign to the variable;
    });
    //dependencies are in scope
    map(module.dependencyVariables, function (variableName) {
        predefinedVariables[variableName] = false;
    });
    
    //when evaluating the test code, __module is in scope as well
    predefinedVariables["__module"] = false;
    
    var testCodeResult = linter(module.testFunctionBody, lintpreferences, predefinedVariables);
    reportResult(testCodeResult, "ModuleTests", writeLog);

    delete predefinedVariables["__module"];

    var moduleCodeResult = linter(module.defineFunctionBody, lintpreferences, predefinedVariables);
    reportResult(moduleCodeResult, "Module", writeLog);

    if (testCodeResult.passed && moduleCodeResult.passed) {
        promise.fulfill();
    } else {
        promise.reject();
    }

    return promise;
}
return runLint;