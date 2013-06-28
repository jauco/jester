---
dependencies:
    objLoop: tools/objLoop
    moduleAsVariable: ./moduleTransformers/moduleAsVariable
    limitScope: ./tools/limitScope
    buildAllModulesInOneFile: ./tools/buildAllModulesInOneFile
    runModuleTest: ./moduleTransformers/runModuleTest
---
---
---
function buildTessTestfile(AMDidToTest, AmdModules) {
    var buildModules = objLoop(AmdModules, function (AMDid, module) { 
        var isModuleToTest = (AMDid === AMDidToTest);
        if (isModuleToTest) {
            return runModuleTest(module);
        } else {
            return moduleAsVariable(module);
        }
    });
    return limitScope(buildAllModulesInOneFile(AMDidToTest, buildModules));
}
return buildTessTestfile;