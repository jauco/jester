---
dependencies:
    objLoop: tools/objLoop
    moduleAsVariable: ./moduleTransformers/moduleAsVariable
    limitScope: ./tools/limitScope
    buildAllModulesInOneFile: ./tools/buildAllModulesInOneFile
---
---
---
function buildTestCode(AMDid, AmdModules) {
    var buildModules = objLoop(AmdModules, function (AMDid, module) { return moduleAsVariable(module); });
    return limitScope(buildAllModulesInOneFile(AMDid, buildModules));
}
return buildTestCode;