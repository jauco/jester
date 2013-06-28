---
expects:
    console: http://developer.mozilla.org/en-US/docs/DOM/console.log
dependencies:
    map: tools/map
    test: richard/test
---
test(__module.AMDid, function (it) {
    function createDependencyStructure() {
        var structure = {
            moduleStore: {},
            getOriginalModulesFromResult: function (result) {
                return map(result, function (m) {
                    return m.module;
                });
            },
            addModule: function m(id, dependencies, testDependencies) {
                structure.moduleStore[id] = {
                    dependencies: dependencies || [],
                    testDependencies: testDependencies || [],
                    toString: function () { return "<" + id + ">"; }
                };
            },
            call: function () {
                return structure.orderModules({"main module": ["module1"]}, structure.moduleStore);
            }
        };
        structure.orderModules = __module.constructor();
        return structure;
    }
    it("returns a list with the requested modules and their dependencies", function (expect) {
        var structure, result;
        structure = createDependencyStructure();

        structure.addModule("module1", ["module2"]);
        structure.addModule("module2");

        result = structure.call();
        expect(structure.getOriginalModulesFromResult(result)).toEqual([structure.moduleStore.module2, structure.moduleStore.module1]);
    });
    it("includes dependencies for both the testfunction and the normal function", function (expect) {
        var structure, result;
        structure = createDependencyStructure();
        structure.addModule("module1", ["module3"], ["module2"]);
        structure.addModule("module2");
        structure.addModule("module3");

        result = structure.call();
        expect(structure.getOriginalModulesFromResult(result)).toEqual([structure.moduleStore.module3, structure.moduleStore.module2, structure.moduleStore.module1]);
    });
    it("stores a duplicate dependency above the first dependendant, and not twice", function (expect) {
        var structure, result;
        structure = createDependencyStructure();
        structure.addModule("module1", ["module2", "module3"]);
        structure.addModule("module2", ["module3"]);
        structure.addModule("module3");

        result = structure.call();
        expect(structure.getOriginalModulesFromResult(result)).toEqual([structure.moduleStore.module3, structure.moduleStore.module2, structure.moduleStore.module1]);
    });
    it("sets 'dependency of testfunction' as inclusionreason for the testfunction dependencies ", function (expect) {
        var structure, result;
        structure = createDependencyStructure();
        structure.addModule("module1", [], ["module2"]);
        structure.addModule("module2");
        
        result = structure.call();
        expect(result[0].inclusionReason).toEqual({"dependency of testfunction": true});
    });
    it("stores both inclusionReasons in the IncludedModule if a dependency is required twice for different reasons", function (expect) {
        var structure, result;
        structure = createDependencyStructure();
        structure.addModule("module1", ["module2"], ["module3"]);
        structure.addModule("module2", ["module3"]);
        structure.addModule("module3");
        
        result = structure.call();
        expect(result[0].inclusionReason).toEqual({"dependency of main module":true, "dependency of testfunction":true});
    });
    it("will only add 'dependency of ' once.", function (expect) {
        var structure, result;
        structure = createDependencyStructure();
        structure.addModule("module1", ["module2"]);
        structure.addModule("module2", ["module3"]);
        structure.addModule("module3");

        result = structure.call();
        expect(result[0].inclusionReason).toEqual({"dependency of main module": true});
    });
});
---
---
// "()" id, moduleStore:

//     moduleStore <- "[]" id without "<nil>" as module
//     module <- ".dependencies" as dependencies
//     moduleStore <- "[]" dependencies without "<nil>" as module

//     return array<module>
function moduleExists(AMDModule, includedModules) {
    var i;
    for (i = 0; i < includedModules.length; i += 1) {
        if (includedModules[i] === AMDModule) {
            return true;
        }
    }
    return false;
}

function addModuleDependencies(result, AMDids, store, modulesThatAreBeingLoaded) {
    var i, AMDModule;
    for (i = 0; i < AMDids.length; i += 1) {
        if (modulesThatAreBeingLoaded.hasOwnProperty(AMDids[i])) {
            throw new Error("circular dependency somewhere in "+Object.keys(modulesThatAreBeingLoaded).join(", "));
        }
        AMDModule = store[AMDids[i]];
        if (AMDModule == null) {
            console.log(AMDids[i] + " is not available");
        } else {
            if (!moduleExists(AMDModule, result)) {
                modulesThatAreBeingLoaded[AMDids[i]] = true;
                addModuleDependencies(result, AMDModule.dependencies, store, modulesThatAreBeingLoaded);
                delete modulesThatAreBeingLoaded[AMDids[i]];
                result.push(AMDModule);
            }
        }
    }
}

function getModuleAndDependencies(id, store) {
    var result = [];
    addModuleDependencies(result, [id], store, {});
    return result;
}
return getModuleAndDependencies;