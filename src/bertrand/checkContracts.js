---
expects:
    console: http://developer.mozilla.org/en-US/docs/DOM/console.log
dependencies:
    objLoop: tools/objLoop
    filter: tools/filter
    reduce: tools/reduce
    map: tools/map
    contains: tools/contains
    parseSnapshot: ./parseSnapshot
    test: richard/test
    template: richard/template
---
/*jshint -W074 */
test(__module.AMDid, function (it, check) {
    function xit(){}
    function createDependencyStructure() {
        return {
            init: function () {
                return __module.constructor(objLoop, filter, reduce, map, contains, parseSnapshot);
            }
        };
    }
    check("drive cases", function (it) {
        it("passes when the message exists", function (expect) {
            var result, deps, checkContracts, contractLines;
            deps = createDependencyStructure();
            checkContracts = deps.init();

            var snapshot = {
                "contractA": {
                    contractText:
                        'contract:\n' +
                        '    "msg":\n',
                    dependencies: [],
                    dependencyVariables: []
                },
                "trigger": {
                    contractText:
                        'contract:\n' +
                        '    side-effects:\n' +
                        '        contractA <- "msg"',
                    dependencies: ["contractA"],
                    dependencyVariables: ["contractA"]
                }
            };
            contractLines = parseSnapshot(snapshot);
            result = checkContracts(contractLines);
            expect(result.passed).toBe(true);
            expect(contractLines).toEqual(template({
                "contractA": {
                    checks: [
                        {message: '"msg"'}
                    ]
                }
            }));
        });
        it("doesn't pass when the message doesn't exist", function (expect) {
            var result, deps, checkContracts, contractLines;
            deps = createDependencyStructure();
            checkContracts = deps.init();

            var snapshot = {
                "contractA": {
                    contractText:
                        'contract:\n' +
                        '    "msg":\n',
                    dependencies: [],
                    dependencyVariables: []
                },
                "trigger": {
                    contractText:
                        'contract:\n' +
                        '    side-effects:\n' +
                        '        contractA <- "some other message"',
                    dependencies: ["contractA"],
                    dependencyVariables: ["contractA"]
                }
            };
            contractLines = parseSnapshot(snapshot);
            result = checkContracts(contractLines);
            expect(result.passed).toBe(false);
            expect(contractLines).toEqual(template({
                "contractA": {
                    checks: [
                        {message: '"some other message"'}
                    ]
                }
            }));
        });
        it("doesn't pass when one message doesn't exists", function (expect) {
            var result, deps, checkContracts, contractLines;
            deps = createDependencyStructure();
            checkContracts = deps.init();

            var snapshot = {
                "contractA": {
                    contractText:
                        'contract:\n' +
                        '    "msg":\n',
                    dependencies: [],
                    dependencyVariables: []
                },
                "trigger": {
                    contractText:
                        'contract:\n' +
                        '    side-effects:\n' +
                        '        contractA <- "msg"' +
                        '        contractA <- "some other message"',
                    dependencies: ["contractA"],
                    dependencyVariables: ["contractA"]
                }
            };
            contractLines = parseSnapshot(snapshot);

            result = checkContracts(contractLines);
            expect(result.passed).toBe(false);
        });
        it("doesn't pass when one value doesn't contain the message", function (expect) {
            var result, deps, checkContracts, contractLines;
            deps = createDependencyStructure();
            checkContracts = deps.init();

            var snapshot = {
                "contractA": {
                    contractText:
                        'contract:\n' +
                        '    "msg":\n',
                    dependencies: [],
                    dependencyVariables: []
                },
                "contractB": {
                    contractText:
                        'contract:\n',
                    dependencies: [],
                    dependencyVariables: []
                },
                "trigger": {
                    contractText:
                        'contract:\n' +
                        '    side-effects:\n' +
                        '        contractA as val\n' +
                        '        contractB as val\n' +
                        '        val <- "msg"',
                    dependencies: ["contractA", "contractB"],
                    dependencyVariables: ["contractA", "contractB"]
                }
            };
            contractLines = parseSnapshot(snapshot);
            result = checkContracts(contractLines);
            expect(result.passed).toBe(false);
        });
        it("sends the results of a message-check onwards and runs the checks on the result as well", function (expect) {
            var result, deps, checkContracts, contractLines;
            deps = createDependencyStructure();
            checkContracts = deps.init();

            var snapshot = {
                "contractA": {
                    contractText:
                        'contract:\n' +
                        '    "msg":\n' +
                        '        contractB as result\n',
                    dependencies: ["contractB"],
                    dependencyVariables: ["contractB"]
                },
                "contractB": {
                    contractText:
                        'contract:\n' + 
                        '    "bmessage":',
                    dependencies: [],
                    dependencyVariables: []
                },
                "trigger": {
                    contractText:
                        'contract:\n' +
                        '    side-effects:\n' +
                        '        contractA <- "msg" <- "bmessage"',
                    dependencies: ["contractA"],
                    dependencyVariables: ["contractA"]
                }
            };
            contractLines = parseSnapshot(snapshot);

            result = checkContracts(contractLines);
            expect(result.passed).toBe(true);
            expect(contractLines).toEqual(template({
                "contractB(contract)": {
                    oldChecks: [
                        {message: '"bmessage"'}
                    ]
                }
            }));
        });
        it("fails when a parameter is missing", function (expect) {
            var result, deps, checkContracts, contractLines;
            deps = createDependencyStructure();
            checkContracts = deps.init();

            var snapshot = {
                "contractA": {
                    contractText:
                        'contract:\n' +
                        '    side-effects:\n' +
                        '        contractB <- "msg"\n',
                    dependencies: ["contractB", "contractC"],
                    dependencyVariables: ["contractB", "contractC"]
                },
                "contractB": {
                    contractText:
                        'contract:\n' + 
                        '    "msg" param:',
                    dependencies: [],
                    dependencyVariables: []
                },
                "contractC": {
                    contractText:
                        'contract:\n',
                    dependencies: [],
                    dependencyVariables: []
                }
            };
            contractLines = parseSnapshot(snapshot);

            result = checkContracts(contractLines);
            expect(result.passed).toBe(false);
        });
        it("succeeds when the parameter is passed", function (expect) {
            var result, deps, checkContracts, contractLines;
            deps = createDependencyStructure();
            checkContracts = deps.init();

            var snapshot = {
                "contractA": {
                    contractText:
                        'contract:\n' +
                        '    side-effects:\n' +
                        '        contractB <- "msg" contractC\n',
                    dependencies: ["contractB", "contractC"],
                    dependencyVariables: ["contractB", "contractC"]
                },
                "contractB": {
                    contractText:
                        'contract:\n' + 
                        '    "msg" param:',
                    dependencies: [],
                    dependencyVariables: []
                },
                "contractC": {
                    contractText:
                        'contract:\n',
                    dependencies: [],
                    dependencyVariables: []
                }
            };
            contractLines = parseSnapshot(snapshot);

            result = checkContracts(contractLines);
            expect(result.passed).toBe(true);
        });
        it("keeps messages apart", function (expect) {
            var result, deps, checkContracts, contractLines;
            deps = createDependencyStructure();
            checkContracts = deps.init();
            var snapshot = {
                "mod1": {
                    contractText:
                        'contract:\n' +
                        '    side-effects:\n' +
                        '        contract_that_returns_param <- "msg" typeA <- "message A"\n' +
                        '        contract_that_returns_param <- "msg" typeB <- "message B"',
                    dependencies: ['mod/contract_that_returns_param', "mod/typeA", "mod/typeB"],
                    dependencyVariables: ['contract_that_returns_param', "typeA", "typeB"]
                },
                "mod/typeA": {
                    contractText:
                        'contract:\n' +
                        '    "message A":',
                    dependencies: [],
                    dependencyVariables: []
                },
                'mod/typeB': {
                    contractText:
                        'contract:\n' +
                        '    "message B":',
                    dependencies: [],
                    dependencyVariables: []
                },
                'mod/contract_that_returns_param': {
                    contractText:
                        'contract:\n' +
                        '    "msg" param:\n' +
                        '        param as result',
                    dependencies: [],
                    dependencyVariables: []
                }
            };
            contractLines = parseSnapshot(snapshot);
            result = checkContracts(contractLines);

            expect(result.passed).toBe(true);
            expect(contractLines).toEqual(template({
                "mod/contract_that_returns_param(contract)": {
                    oldChecks: [
                        {message: '"msg"', parameters: ['"mod/typeA"']},
                        {message: '"msg"', parameters: ['"mod/typeB"']}
                    ]
                }
            }));
        });
    });
});
---
---
function flattenValues(variable, result) {
    if (result === undefined) {
        result = [];
    }
    map(variable.values, function (val) {
        if (val.hasOwnProperty("values")) {
            flattenValues(val, result);
        } else {
            result.push(val);
        }
    });
    return result;
}

function actualCheck(contractLines, data) {
    data.wasChanged = false;
    objLoop(contractLines, function (variableName, variable) {
        //side-effects isn't a message (no quotes around it) it represents what happens in de constructor function
        if (variable.definedMessages && variable.definedMessages["side-effects"] && !variable.definedMessages["side-effects"].wasCalled) {
            variable.definedMessages["side-effects"].test();
            variable.definedMessages["side-effects"].wasCalled = true;
            data.wasChanged = true;
        }
        if (variable.hasOwnProperty("checks")) {
            map(variable.checks, function (check) {
                map(flattenValues(variable), function (value) {
                    var messageToCheck;
                    value.oldChecks = value.oldChecks || [];
                    if (contains(value.oldChecks, check)) {
                        return;
                    }
                    value.oldChecks.push(check);
                    
                    if (!value.definedMessages.hasOwnProperty(check.message)) {
                        data.details.push([value, check]);
                        data.passed = false;
                        return;
                    }

                    messageToCheck = value.definedMessages[check.message];
                    if ((messageToCheck.test.length - 1) !== check.parameters.length) {
                        data.details.push([messageToCheck.test.length, check.parameters]);
                        data.passed = false;
                        return;
                    }
                    messageToCheck.test.apply(messageToCheck, [check.sendResultTo].concat(check.parameters));
                });
            });
        }
    });
}

function checkContracts(contractLines) {
    var data = {
        passed: true,
        details: [],
        wasChanged: true
    };
    var cycles = 0;
    while (data.wasChanged && cycles <= 100) {
        cycles += 1;
        actualCheck(contractLines, data);
    }
    if (cycles > 100) {
        data.passed = false;
    }
    return {
        passed: data.passed,
        details: data.details
    };
}
return checkContracts;