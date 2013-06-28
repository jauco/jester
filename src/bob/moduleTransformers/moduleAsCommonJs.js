---
dependencies:
    map: tools/map
    createRelativeAMDid: ../tools/createRelativeAMDid
    test: richard/test
    createSpy: richard/createSpy
---
/*jshint evil:true*/
//verifying the generated code is best done using eval
test(__module.AMDid, function (it) {
    function createDependencyStructure() {
        var structure = {
            makeAMDModule: function (dependencies, dependencyVariables, defineFunctionBody) {
                return {
                    AMDid: "ownId",
                    dependencies: dependencies || [],
                    dependencyVariables: dependencyVariables || [],
                    defineFunctionBody: defineFunctionBody || ""
                };
            },
            createRelativeAMDid: createSpy(function createRelativeAMDid(own, to){ return to;}),
            generatedId: "$id",
            init: function () {
                return __module.constructor(map, structure.createRelativeAMDid);
            }
        };
        return structure;
    }
    it("will create a script that require()'s the dependencies", function (expect) {
        var structure = createDependencyStructure(),
            moduleAsAMD = structure.init();

        var resultCode = moduleAsAMD(structure.makeAMDModule(["a", "b"])).code();

        var require = createSpy("require");
        var module = {};
        eval(resultCode);

        expect(require).toHaveBeenCalledWithTheSequence(["a"], ["b"]);
    });
    it("will create a script that assigns the require()d dependencies to the dependencyVariables", function (expect) {
        var structure = createDependencyStructure(),
            moduleAsAMD = structure.init();

        var resultCode = moduleAsAMD(structure.makeAMDModule(["a", "b"], ["varA", "varB"])).code();

        var require = createSpy(function require(dep) { return "loaded: " + dep;});
        var module = {};
        var result = eval(resultCode + ";\n ({varA: varA, varB: varB});");

        expect(result.varA).toEqual("loaded: a");
        expect(result.varB).toEqual("loaded: b");
    });
    it("will create a script that assigns the result to exports", function (expect) {
        var structure = createDependencyStructure(),
            moduleAsAMD = structure.init();

        var resultCode = moduleAsAMD(structure.makeAMDModule(null, null, "return 'foo';")).code();

        var module = {};
        var result = eval(resultCode);

        expect(module.exports).toEqual("foo");
    });
    it("turns the dependencies into relative references", function (expect) {
        var structure = createDependencyStructure(),
            moduleAsAMD = structure.init();

        moduleAsAMD(structure.makeAMDModule(["a", "b"])).code();

        expect(structure.createRelativeAMDid).toHaveBeenCalledWithTheSequence(["ownId", "a"], ["ownId", "b"]);
    });
});
---
---
function dali(template, values) { //a tiny moustache-like template parser. Ha. Ha. 
    return template.replace(/\{([a-zA-Z0-9_\-]+)\}/g, function(_, variable) { return values[variable]; });
}

function moduleAsAMD(AMDModule) {
    return {
        dependencies: [],
        code: function () {
            var code = "";
            map(AMDModule.dependencies, function (dep, index) {
                code += dali("var {varname} = require({dependency});\n", {varname: AMDModule.dependencyVariables[index], dependency: JSON.stringify(createRelativeAMDid(AMDModule.AMDid, dep))});
            });
            code += dali(
                "module.exports = (function() {\n" +
                "{functionBody}\n" +
                "}());",
                {functionBody: AMDModule.defineFunctionBody}
            );
            return code;
        }
    };
}
return moduleAsAMD;