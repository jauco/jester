---
description: update the result artifacts for a module and its dependendants
dependencies:
    walkDependants: ./walkDependants
dependencies:
    buildOnedependencylessJsFile: bob/buildOnedependencylessJsFile
    buildAMDfile: bob/buildAMDfile
    buildCommonJsfile: bob/buildCommonJsfile
    walkDependants: ./walkDependants
    writeFile: ./writeFile
---
---
---
function updateArtifacts(AMDid, snapshot, outputDir, writeLog) {
    writeLog(0, "updating files");
    walkDependants(AMDid, snapshot, function write(module, snapshot, level) {
        writeLog(level + 1, "- " + snapshot[module].path);
        writeFile(outputDir, "concatenated", module, buildOnedependencylessJsFile(module, snapshot));
        writeFile(outputDir, "AMD", AMDid, buildAMDfile(module, snapshot));
        writeFile(outputDir, "CommonJs", AMDid, buildCommonJsfile(module, snapshot));
    });
}
return updateArtifacts;