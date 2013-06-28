---
description: build the testfile and tell the runners to run it
dependencies:
    map: tools/map
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
                return __module.constructor(map, rsvp, this.debugRequested, this.hasTestCode, this.buildTessTestfile);
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
            if (result.runners.length === 0) {
                writeLog(0, "No tests were run, because no capable runners are registered.");
                promise.fulfill();
            } else {
                if (result.passed) {
                    writeLog(0, "unit tests succeeded on " + result.runner + "!");
                    promise.fulfill();
                } else {
                    writeLog(0, "unit tests failed on" + result.runner + ".");
                    writeLog(1, result.details);
                    promise.reject();
                }
            }
        });
        return promise;
    }
}
return runTest;