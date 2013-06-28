---
dependencies:
    test: richard/test
---
/*jshint evil:true*/
//verifying the generated code is best done using eval
test(__module.AMDid, function (it) {
    function createDependencyStructure() {
        var structure = {
            makeAMDModule: function (id, dependencies, defineFunctionBody) {
                return {
                    AMDid: id || "id",
                    dependencies: dependencies || [],
                    dependencyVariables: dependencies || [],
                    defineFunctionBody: defineFunctionBody || ""
                };
            },
            generatedId: "$id",
            init: function () {
                return __module.constructor();
            }
        };
        return structure;
    }
    it("Will assign the result of the defineFunction to a variable whose name is provided in .variableName", function (expect) {
        var structure, module, amd, result;
        structure = createDependencyStructure();
        module = structure.init();

        amd = structure.makeAMDModule(null, null, "return 'magic cookie!';\n");
        result = module(amd);

        expect(eval(result.code() + result.variableName + ";")).toEqual('magic cookie!');
    });

    it("The variable name is unique for a given AMDid", function (expect) {
        var structure, module, amd_a, amd_b, amd_c, result_a, result_b, result_c;
        structure = createDependencyStructure();
        module = structure.init();

        amd_a = structure.makeAMDModule("someId");
        result_a = module(amd_a);

        amd_b = structure.makeAMDModule("someOtherId");
        result_b = module(amd_b);

        amd_c = structure.makeAMDModule("someId");
        result_c = module(amd_c);


        expect(result_a.variableName).not.toEqual(result_b.variableName);
        expect(result_a.variableName).toEqual(result_c.variableName);
    });


    it("parameters provided to .code() are used as variable names to inject dependencies", function (expect) {
        var structure, module, amd, result;
        structure = createDependencyStructure();
        module = structure.init();

        amd = structure.makeAMDModule(null, ["theDependency"], "return theDependency;\n");
        result = module(amd);

        expect(eval("var randomVariable = 'injected cookie!';\n" + result.code({theDependency: "randomVariable"}) + result.variableName + ";")).toEqual('injected cookie!');
    });

    it("will list the dependencies it needs as dependencies", function (expect) {
        var structure, module, amd, result;
        structure = createDependencyStructure();
        module = structure.init();

        amd = structure.makeAMDModule(null, ["theDependency"], null);
        result = module(amd);

        expect(result.dependencies).toEqual(amd.dependencies);
    });

});
---
---
// "()" AMDModule:
    
//     buildable:
//         "dependencies":
//             readOnlyArray as returnvalue
//             readOnlyArray:
//                 "[]" key:
//                     AMDModule <- ".dependencies" <- "[]" key as returnvalue
//                 "for(i)":
//                     AMDModule <- ".dependencies" <- "for(i)" as returnvalue

//         "code" dependencyVariableNames:
//             dependencyVariableNames <- "[]" integer
//             AMDModule <- "+ <validJsCode>;\n" as returnvalue
function amdIdToJsVariable(AMDid) {
    return "$" + AMDid.replace(/[^a-zA-Z_]/g, function (a) { return "$" + a.charCodeAt(0); });
}

function dali(template, values) { //a tiny moustache-like template parser. Ha. Ha. 
    return template.replace(/\{([a-zA-Z0-9_\-]+)\}/g, function(_, variable) { return values[variable]; });
}

function moduleAsVariable(AMDModule) {
    var variableName = amdIdToJsVariable(AMDModule.AMDid);

    return {
        AMDid: AMDModule.AMDid,
        dependencies: AMDModule.dependencies,
        code: function (dependencyVariableNameStore) {
            //test for missing dependency variables
            var varNames = AMDModule.dependencies.map(function (dep) { return dependencyVariableNameStore[dep]; });
            
            return dali(
                "var {objectName} = (function ({dependencies}) {\n" + 
                "{functionBody}\n" +
                "}({dependencyVariableNames}));\n",
                {
                    objectName: variableName,
                    dependencies: AMDModule.dependencyVariables.join(","),
                    functionBody: AMDModule.defineFunctionBody,
                    dependencyVariableNames: varNames.join(",")
                }
            );
        },
        variableName: variableName
    };
}
return moduleAsVariable;