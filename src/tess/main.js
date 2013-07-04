---
desc: Entry point for the test module. Allows external code to register runners and schedule tests on those runners.
dependencies:
    afterAll: tools/afterAll
    map: tools/map
    reduce: tools/reduce
    test: richard/test
---
test(__module.AMDid, function (it) {
    it("should be awesome!", function (expect, promise) {
        expect(true).toBe(true);
    });
});
---
---
function TestSystem() {
    this._runners = [];
}

TestSystem.prototype.addRunner = function (runner) {
    this._runners.push(runner);
};

TestSystem.prototype.runTest = function (code, expectations, useDebugger, callback) {
    var i = 0;
    var validRunners = this._runners.filter(function (runner) { return runner.findMissingMatches(expectations).length === 0; });
    if (validRunners.length === 0 ) {
        callback({ passed: true, details: ["No valid runner found"], runners: [] });
    } else {
        var validRunnerNames = validRunners.map(function (r) { return r.toString(); });
        var runs = map(validRunners, function (runner) { return runner.run(code, useDebugger); });

        afterAll(runs).then(
            function (results) {
                callback(reduce(
                    results, 
                    function (result, runnerResult, i) {
                        runnerResult = runnerResult.valueOf();
                        result.passed = result.passed && runnerResult.passed;
                        result.runners[validRunnerNames[i]] = {
                            passed: runnerResult.passed,
                            details: runnerResult.details
                        };
                        return result;
                    },
                    { passed: true, details: [], runners: {} }
                ));
            },
            function (err) {
                callback({ passed: false, details: [err.stack], runners: validRunnerNames });
            }
        ).fail(function (e) {
            callback({ passed: false, details: [e.stack], runners: validRunnerNames });
        });
    }
};
return TestSystem;