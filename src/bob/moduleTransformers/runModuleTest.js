---
---
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

function ctorName(variableName) {
    return variableName + "_ctor";
}

function metaName(variableName) {
    return variableName + "_meta";
}

function dali(template, values) { //a tiny moustache-like template parser. Ha. Ha. 
    return template.replace(/\{([a-zA-Z0-9_-]+)\}/g, function(_, variable) { return values[variable]; });
}

function runModuleTest(AMDModule) {
    var variableName = amdIdToJsVariable(AMDModule.AMDid);

    return {
        dependencies: AMDModule.dependencies,
        code: function (dependencyStore) {
            //test for missing dependency variables
            var varNames = AMDModule.dependencies.map(function (dep) { return dependencyStore[dep]; });
            
            return dali(
                "(function (__module{dependencyVariableComma}{dependencies}) {\n" +
                "{testFunctionBody}\n" +
                "}({\n" +
                "  AMDid: {AMDid},\n" +
                "  constructor: function ({dependencies}) {\n" +
                "{functionBody}\n" +
                "}\n" +
                "}{dependencyVariableComma}{dependencyVariableNames}));\n",
                {
                    AMDid: JSON.stringify(AMDModule.AMDid),
                    testFunctionBody: AMDModule.testFunctionBody,
                    functionBody: AMDModule.defineFunctionBody,
                    dependencies: AMDModule.dependencyVariables.join(","),
                    dependencyVariableNames: varNames.join(","),
                    dependencyVariableComma: AMDModule.dependencyVariables.length > 0 ? ", " : ""
                }
            );
        },
        variableName: variableName
    };
}

return runModuleTest;