---
description: Write an AMD id to a file
dependencies:
    path: tools/node-wrappers/path
    fs: tools/node-wrappers/fs
    mkdirP: tools/mkdirP
---
---
---
function writeFile(outputDir, filetype, AMDid, contents) {
    var dir = path.join(outputDir, filetype, path.dirname(AMDid));
    var filename = path.join(dir, path.basename(AMDid) + ".js");
    mkdirP(dir, function () {
        fs.writeFile(filename, contents);
    });
}
return writeFile;