---
description: Calls moduleAsCommonJs and provides the same interface as the other build* functions
dependencies:
    moduleAsCommonJs: ./moduleTransformers/moduleAsCommonJs
---
---
---
function buildCommonJsfile(AMDidToTest, AmdModules) {
    var module = AmdModules[AMDidToTest];
    return moduleAsCommonJs(module).code();
}
return buildCommonJsfile;