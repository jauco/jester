---
dependencies:
    contractFileLoader: ./JesterDashSeperated/contractFileLoader
    AMDFileLoader: ./AMD/AMDFileLoader
    fs: tools/node-wrappers/fs
    NotMyType: ./NotMyTypeError
    compileJsx: ./compileJsx

    test: richard/test
    createSpy: richard/createSpy
    EmptyModule: ./EmptyModule
expects:
    console: http://developer.mozilla.org/en-US/docs/DOM/console.log
---
test(__module.AMDid, function (it) {
    function dummyLoader(baseDir, filePath, namespace, contents, callback) {
        callback(undefined, new EmptyModule(baseDir, filePath, namespace));
    }
    var dummyFs = {
        readFile: function (path, encoding, callback) {
            callback(undefined, "");
        }
    };
    it("can load jsx files", function (expect, promise) {
        var fakeJsxCompiler = createSpy("jsxCompiler", "compiled code");
        var loadModule = __module.constructor(dummyLoader, dummyLoader, dummyFs, NotMyType, fakeJsxCompiler);
        loadModule("/foo/", "/foo/bar", "", function (err, result) {
            expect(fakeJsxCompiler).toHaveBeenCalled();
            expect(result.testFunctionBody).toEqual("compiled code");
            expect(result.defineFunctionBody).toEqual("compiled code");
            promise.fulfill();
        });
        return promise;
    });

});
---
---
var handlers = [
    contractFileLoader,
    AMDFileLoader
];

function handleOrDelegate(handlerId, baseDir, filePath, namespace, contents, callback) {
    if (handlers[handlerId]) {
        handlers[handlerId](baseDir, filePath, namespace, contents, function (error, module) {
            var bodyWithFunction, compiledBodyWithFunction;
            if (!error) {
                try {
                    if (module && module.hasOwnProperty("testFunctionBody")) {
                        module.testFunctionBody = compileJsx(module.testFunctionBody);
                    }
                    if (module && module.hasOwnProperty("defineFunctionBody")) {
                        module.defineFunctionBody = compileJsx(module.defineFunctionBody);
                    }
                } catch (e) {
                    error = e;
                }
            }
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