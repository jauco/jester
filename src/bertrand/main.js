---
description:
    iterates over snapshot and adds all contracts to a store. Calls check on all contracts in the store
expects:
    console: http://developer.mozilla.org/en-US/docs/DOM/console.log
dependencies:
    checkContracts: ./checkContracts
    parseSnapshot: ./parseSnapshot
    
    test: richard/test
    createSpy: richard/createSpy
    any: richard/any
    template: richard/template
---
test(__module.AMDid, function (it, spec) {
    function createDependencyStructure() {
        var structure = {
            checkContracts: createSpy("checkContracts", {passed: true, details: ["detail"]}),
            parseSnapshot: createSpy("parseSnapshot", {}),
            init: function () {
                return __module.constructor(structure.checkContracts, structure.parseSnapshot);
            }
        };
        return structure;
    }
    it("it calls the parseSnapshot with the module snapshot", function (expect) {
        var deps = createDependencyStructure(),
            main = deps.init();

        var snapshot = {};
        var result = main(snapshot);
        expect(deps.parseSnapshot).toHaveBeenCalledWith(snapshot);
    });
    it("it calls the contractChecker with the parsed contracts", function (expect) {
        var deps = createDependencyStructure(),
            main = deps.init();

        var result = main();
        expect(deps.checkContracts).toHaveBeenCalledWith(deps.parseSnapshot.result);
        expect(result).toEqual(deps.checkContracts.result);
    });
    spec("parse integration tests", function (handle) {
        function parse(snapshot) {
            var main = __module.constructor(function(parsed){ return parsed; }, parseSnapshot);
            return main(snapshot);
        }
        handle("simplest", function (expect) {
            var result = parse({
                "mod1": {
                    dependencies: [],
                    dependencyVariables: [],
                    contractText: 
                        "contract:"
                }
            });
            expect(result).toEqual(template({
                "mod1(contract)": {
                    definedMessages: {}
                }
            }));
        });
        handle("1 message", function (expect) {
            var result = parse({
                "mod1": {
                    dependencies: [],
                    dependencyVariables: [],
                    contractText: 
                        "contract:\n" +
                        '   "a message":\n'
                }
            });
            expect(result).toEqual(template({
                "mod1(contract)": {
                    definedMessages: {
                        '"a message"': {
                            result: "mod1::\"a message\"::result",
                            parameters: []
                        }
                    }
                }, 
                'mod1::"a message"::result': {
                    checks: [], 
                    values: []
                }
            }));
        });
        handle("1 message with a parameter", function (expect) {
            var result = parse({
                "mod1": {
                    dependencies: [],
                    dependencyVariables: [],
                    contractText: 
                        "contract:\n" +
                        '   "a message" param:\n'
                }
            });
            expect(result).toEqual(template({
                "mod1(contract)": {
                    definedMessages: {
                        '"a message"': {
                            parameters: ['mod1::"a message"::param']
                        }
                    }
                }, 
                'mod1::"a message"::param': {
                    checks: [], 
                    values: []
                }
            }));
        });
        handle("1 message with a parameter and an assertion", function (expect) {
            var result = parse({
                "mod1": {
                    dependencies: [],
                    dependencyVariables: [],
                    contractText: 
                        "contract:\n" +
                        '   "a message" param:\n' +
                        '      param <- "foo"\n'
                }
            });
            expect(result).toEqual(template({
                'mod1::"a message"::param': {
                    checks: [
                        {message: '"foo"', sendResultTo: 'mod1::"a message":: var0', parameters: []}
                    ]
                }
            }));
        });
        handle("1 message with a parameter and multiple assertions", function (expect) {
            var result = parse({
                "mod1": {
                    dependencies: [],
                    dependencyVariables: [],
                    contractText: 
                        "contract:\n" +
                        '   "a message" param:\n' +
                        '      param <- "foo" <- "bar"\n'
                }
            });
            expect(result).toEqual(template({
                'mod1::"a message"::param': {
                    checks: [
                        {message: '"foo"', sendResultTo: 'mod1::"a message":: var1', parameters: []}
                    ]
                },
                'mod1::"a message":: var1': {
                    checks: [
                        {message: '"bar"', sendResultTo: 'mod1::"a message":: var2', parameters: []}
                    ]
                }
            }));
        });                                                                                                             
        handle("1 message with an assertion with an unbound variable as parameter", function (expect) {
            var result = parse({
                "mod1": {
                    dependencies: [],
                    dependencyVariables: [],
                    contractText: 
                        "contract:\n" +
                        '   "a message" param:\n' +
                        '      param <- "foo" bar\n'
                }
            });
            expect(result).toEqual(template({
                'mod1::"a message"::param': {
                    checks: [
                        {message: '"foo"', parameters: ['mod1::"a message"::bar']}
                    ]
                },
                'mod1::"a message"::bar': {}
            }));
        });
        handle("1 message with an assertion with a bound variable as parameter", function (expect) {
            var result = parse({
                "mod1": {
                    dependencies: ["my/Dep/id"],
                    dependencyVariables: ["bar"],
                    contractText: 
                        "contract:\n" +
                        '   "a message":\n' +
                        '      bar <- "foo"\n'
                },
                "my/Dep/id": {
                    dependencies: [],
                    dependencyVariables: [],
                    contractText: 
                        "contract:\n" +
                        '   "foo":\n'
                }
            });
            expect(result).toEqual(template({
                "my/Dep/id": {
                    checks: [
                        {message: '"foo"'}
                    ]
                }
            }));
            expect(result).not.toHave('mod1::"a message"::bar');
        });
    });
    spec("check integration tests", function (handle) {
        function check(snapshot) {
            var main = __module.constructor(checkContracts, parseSnapshot);
            return main(snapshot);
        }
        handle("non-existing depende", function (expect) {
            var result = check({
                "mod1": {
                    dependencies: [],
                    dependencyVariables: [],
                    contractText: 
                        "contract:\n" +
                        '  "msg":\n'
                },
                "mod2": {
                    dependencies: ["mod1"],
                    dependencyVariables: ["mod1"],
                    contractText: 
                        "contract:\n" +
                        '  "msg":\n' +
                        '    mod1 <- "non-existing"\n'
                }
            });
            expect(result).toEqual(template({passed: false}));
        });
    });
    it("foo", function () {
        var snapshot = {
            "mod1": {
                contractText:
                    'contract:\n' +
                    '    "trigger":\n' +
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
        var main = __module.constructor(function(){}, parseSnapshot);
        main(snapshot);
    });
});
---
---
// contract:
//     "()" snapshot:
//         parseSnapshot <- "()" snapshot as parsed
//         checkContracts <- "()" parsed as result
function main(snapshot) {
    return checkContracts(parseSnapshot(snapshot));
}

return main;