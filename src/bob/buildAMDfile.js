---
description: Calls moduleAsAMD and provides the same interface as the other build* functions
dependencies:
    moduleAsAMD: ./moduleTransformers/moduleAsAMD
---
---
---
function buildAMDfile(AMDidToTest, AmdModules) {
    var module = AmdModules[AMDidToTest];
    return moduleAsAMD(module).code();
}
return buildAMDfile;