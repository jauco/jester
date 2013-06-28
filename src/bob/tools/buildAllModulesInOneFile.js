---
dependencies:
    orderModules: ./getModuleAndDependencies
    reduce: tools/reduce

    test: richard/test
    createSpy: richard/createSpy
---
test(__module.AMDid, function (it) {
    function createDependencyStructure() {
        var orderedModules = [
            {
                inclusionReason: { "other reason": true, "dependency of main module": true },
                moduleCode: function () {
                    return "dependency with other reason code;";
                }
            },
            {
                inclusionReason: { "other reason": true },
                moduleCode: function () {
                    return "code that shouldn't be included;";
                }
            },
            {
                inclusionReason: { "dependency of main module": true },
                moduleCode: function () {
                    return "dependency code;";
                }
            },
            {
                inclusionReason: { "main module": true },
                moduleCode: function () {
                    return "main module code;";
                }
            },
            {
                inclusionReason: { "main module": true, "some other reason": true },
                moduleCode: function () {
                    return "main module with other reason code;";
                }
            }
        ];
        var structure = {
            orderModules: createSpy("orderModules", orderedModules), 
            AmdModules: {
                aModuleId: {
                    callExecuteCode: function () { 
                        return "";
                    }
                }
            },
            reduce: reduce
        };
        structure.assembleTestModule = __module.constructor(structure.orderModules, function () { return structure.reduce.apply(this, arguments); });
        return structure;
    }

    it("concatenates the moduleCode() for the orderedModules of the main module and it's dependencies", function (expect) {
        var structure, result;

        structure = createDependencyStructure();

        result = structure.assembleTestModule("aModuleId", structure.AmdModules);

        expect(result).toEqual("dependency with other reason code;dependency code;main module code;main module with other reason code;");
    });
    
    it("combines the assembled string with code to execute the main module", function (expect) {
        var structure, result;

        structure = createDependencyStructure();
        structure.reduce = function () { return "assembledString;"; };
        structure.AmdModules["aModuleId"].callExecuteCode = function () { return "executeCode;"; };

        result = structure.assembleTestModule("aModuleId", structure.AmdModules);

        expect(structure.limitScope).toHaveBeenCalledWith("assembledString;executeCode;");
    });
});
---
---
// var ct = runner.contract;
// this.contract = ct(this.AMDid, [], {
//     "()": function (module, AmdModules) {
//         module.send("<is string>?"); //will be used as the key in an object

//         var moduleArg = ct("module (assembleTestModule)", [], {"for(in)": ct.arr(module)});
//         var assembled = orderModules.contract.send("()", moduleArg, AmdModules);
//         var modules = assembled.send("for(i)");
//         modules.send(".inclusionReason").send("for(in)");
        
//         modules.send(".moduleCode()").send("<valid js>");

//         AmdModules.send("[]").send(".callExecuteCode()").send("<valid js>");
//         return limitScope.contract.send("()", ct.str.extend("assembledstring + executeCode", [], {
//             "<valid js>": ct.undef
//         }));
//     }
// });

function buildAllModulesInOneFile(AMDid, AmdModules) {
    var assembledString, dependencyStore = {};

    assembledString = reduce(
        orderModules(AMDid, AmdModules), 
        function (code, m) { 
            dependencyStore[m.AMDid] = m.variableName;
            return code + m.code(dependencyStore);
        },
        ""
    );

    return assembledString;
}
return buildAllModulesInOneFile;