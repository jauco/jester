---
dependencies:
    contractFileLoader: ./JesterDashSeperated/contractFileLoader
    AMDFileLoader: ./AMD/AMDFileLoader
    fs: tools/node-wrappers/fs
    NotMyType: ./NotMyTypeError
---
---
---
var handlers = [
    contractFileLoader,
    AMDFileLoader
];

function handleOrDelegate(handlerId, baseDir, filePath, namespace, contents, callback) {
    if (handlers[handlerId]) {
        handlers[handlerId](baseDir, filePath, namespace, contents, function (error, module) {
            if (error instanceof NotMyType) {
                handleOrDelegate(handlerId + 1, baseDir, filePath, namespace, contents, callback);
            } else {
                callback(error, module);
            }
        });
    } else {
        callback(undefined, undefined);
    }
}

function loadModule(baseDir, filePath, namespace, callback) {
    try {
        fs.readFile(filePath, 'utf-8', function (errors, contents) {
            if (errors) {
                //something went wrong while reading the file. This usually means that the file is not really available
                //so we're signaling as if its not a real js file.
                callback(errors, undefined);
            } else {
                handleOrDelegate(0, baseDir, filePath, namespace, contents, callback);
            }
        });
    } catch (e) {
        //something went wrong with loading the module. So it still might be a js module.
        callback(e, undefined);
    }
}

return loadModule;