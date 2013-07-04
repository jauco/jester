---
description: build the testfile and tell the runners to run it
dependencies:
    map: tools/map
    objLoop: tools/objLoop
    rsvp: tools/rsvp
    debugRequested: ./debugRequested
    hasTestCode: ./hasTestCode
    buildTessTestfile: bob/buildTessTestfile

    test: richard/test
    createSpy: richard/createSpy
---
test(__module.AMDid, function (it) {
    function moduleFactory() {
        return {
            debugRequested: createSpy("debugRequested", false),
            hasTestCode: createSpy("hasTestCode", true),
            buildTessTestfile: createSpy("buildTessTestfile", ""),
            createModule: function () {
                return __module.constructor(map, objLoop, rsvp, this.debugRequested, this.hasTestCode, this.buildTessTestfile);
            }
        };
    }

    it("runs runTest", function (expect) {
        var factory = moduleFactory();
        var runTest = factory.createModule();

        var testSystem = {
            runTest: createSpy(function(code, reqs, debugWasRequested, callback) {
                callback({
                    runners: ["node"],
                    passed: false,
                    details: [
                        "foo",
                        "bar"
                    ]
                });
            })
        };
        runTest("foo", {"foo": { expectations: {} }}, testSystem, function () {});

        expect(testSystem.runTest).toHaveBeenCalled();
    });

});
---
---
function runTest(AMDid, snapshot, testSystem, writeLog) {
    var module = snapshot[AMDid];
    if (!hasTestCode(module)) {
        writeLog(0, "No tests were run, because no tests were defined.");
    } else {
        var promise = rsvp.promise();
        
        var testCode = buildTessTestfile(AMDid, snapshot);
        var debugWasRequested = debugRequested(testCode);
        var runnerRequirements = module.expectations;

        testSystem.runTest(testCode, runnerRequirements, debugWasRequested, function handleResults(result) {
            if (Object.keys(result.runners).length === 0) {
                writeLog(0, "No tests were run, because no capable runners are registered.");
                promise.fulfill();
            } else {
                objLoop(result.runners, function (runnerName, result) {
                    if (result.passed) {
                        writeLog(0, "unit tests succeeded on " + runnerName + "!");
                    } else {
                        writeLog(0, "unit tests failed on" + runnerName + ".");
                        writeLog(1, result.details);
                    }
                });
                if (result.passed) {
                    promise.fulfill("unit tests succeeded!");
                } else {
                    promise.fulfill("unit tests failed!");
                }
            }
        });
        return promise;
    }
}
return runTest;