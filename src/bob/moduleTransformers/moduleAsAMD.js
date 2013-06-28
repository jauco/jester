---
dependencies:
    map: tools/map
    test: richard/test
---
/*jshint evil:true*/
//verifying the generated code is best done using eval
test(__module.AMDid, function (it) {
    function createDependencyStructure() {
        var structure = {
            makeAMDModule: function (dependencies, dependencyVariables, defineFunctionBody) {
                return {
                    dependencies: dependencies || [],
                    dependencyVariables: dependencyVariables || [],
                    defineFunctionBody: defineFunctionBody || ""
                };
            },
            generatedId: "$id",
            init: function () {
                return __module.constructor(map);
            }
        };
        return structure;
    }
    it("will create a define call that contains the dependencies", function (expect) {
        var structure = createDependencyStructure(),
            moduleAsAMD = structure.init();

        var resultCode = moduleAsAMD(structure.makeAMDModule(["a", "b"])).code();

        var testIncantation = 
            "var result;\n" + 
            "function define(deps, func) {\n" +
            "    result = deps;\n" +
            "}\n" +
            resultCode +
            "result;\n";

        expect(eval(testIncantation)).toEqual(["a", "b"]);
    });

    it("will create a constructir function that accepts the dependencies", function (expect) {
        var structure = createDependencyStructure(),
            moduleAsAMD = structure.init();

        var resultCode = moduleAsAMD(structure.makeAMDModule([], ["a", "b"])).code();

        var testIncantation = 
            "var result;\n" + 
            "function define(deps, func) {\n" +
            "    result = func.toString();\n" +
            "}\n" +
            resultCode +
            "result;\n";

        expect(eval(testIncantation)).toEqual("function (a,b) {\n\n}");
    });

    it("contains the function body", function (expect) {
        var structure = createDependencyStructure(),
            moduleAsAMD = structure.init();

        var resultCode = moduleAsAMD(structure.makeAMDModule([], [], "return 'cookie!';")).code();

        var testIncantation = 
            "var result;\n" + 
            "function define(deps, func) {\n" +
            "    result = func();\n" +
            "}\n" +
            resultCode +
            "result;\n";

        expect(eval(testIncantation)).toEqual("cookie!");
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
            return dali(
                "define([{dependencies}], function ({dependencyVariables}) {\n" + 
                "{functionBody}\n" +
                "});\n",
                {
                    functionBody: AMDModule.defineFunctionBody,
                    dependencyVariables: AMDModule.dependencyVariables.join(","),
                    dependencies: map(AMDModule.dependencies, function(name) {return JSON.stringify(name);}).join(",")
                }
            );
        }
    };
}
return moduleAsAMD;