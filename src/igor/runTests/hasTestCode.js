---
description: detect if a module has actual code to test
---
---
---
return function hasTestCode(module) {
    return module.testFunctionBody && module.testFunctionBody.trim().length > 0;//fixme: use a js parser and also fail if the contents is nothing but comments
};