---
desc: Module that implements the amd module contract
dependencies:
    getAmdIdFromPath: ./tools/getAmdIdFromPath
---
---
---
function ModuleBase() {

}
ModuleBase.prototype.init = function (baseDir, filePath, namespace) {
    this.AMDid = namespace + "/" + getAmdIdFromPath(baseDir, filePath);
    this.dependencies = [];
    this.dependencyVariables = [];
    this.expectations = {};
    this.contractText = "";
    this.defineFunctionBody = "";
    this.testFunctionBody = "";
}

function EmptyModule(baseDir, filePath, namespace) {
    this.init(baseDir, filePath, namespace);
}

EmptyModule.prototype = new ModuleBase();

return EmptyModule;