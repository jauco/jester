---
expects:
    console: "http://developer.mozilla.org/en-US/docs/DOM/console.log"
dependencies:
    getDirContents: ./getDirContents
    loadModule: ./moduleLoaders/delegatingLoader
    dirWatcher: ./dirWatcher
    map: tools/map
    objLoop: tools/objLoop

    test: richard/test
    createSpy: richard/createSpy
    template: richard/template
---
test(__module.AMDid, function (it) {
    function createDependencyStructure() {
        var getDirContentDoneCallbacks = [];
        var structure = {
            dirContentCallbacks: {},
            getDirContents: function getDirContentsFake(dir, callback, doneCallback) {
                structure.dirContentCallbacks[dir] = callback;
                getDirContentDoneCallbacks.push(doneCallback);
            },
            getDirContentsIsDone: function () {
                map(getDirContentDoneCallbacks, function (f) { f(); });
            },
            loadModule: function loadModule(dir, filePath, namespace, callback) {
                var module = {
                    AMDid: filePath,
                    addNamespace: function (namespace) {
                        module.namespaceAdded = true;
                    },
                    dependencies: []
                };
                callback(undefined, module);
            },
            sendFileUpdate: {},
            dirWatcher: function (dir, callback) {
                structure.sendFileUpdate[dir] = callback;
            },
            init: function () {
                return __module.constructor(structure.getDirContents, structure.loadModule, structure.dirWatcher, map, objLoop);
            }
        };
        
        return structure;
    }

    it("calls addedOrChangedCallback when dirwatcher indicates a *.js file was added or changed", function (expect) {
        var getModules, structure, addedOrChangedCallback;

        structure = createDependencyStructure();
        getModules = structure.init();
        addedOrChangedCallback = createSpy(function addedOrChangedCallback(module, snapshot) {});

        getModules({"dirA":"dirA"}, addedOrChangedCallback, function() {});
        structure.getDirContentsIsDone();

        expect(addedOrChangedCallback).not.toHaveBeenCalled();
        structure.sendFileUpdate["dirA"]("aFile.js", true);
        expect(addedOrChangedCallback).toHaveBeenCalled();
    });
    it("calls deletedCallback when dirwatcher indicates a *.js file was deleted", function (expect) {
        var getModules, structure, deletedCallback;

        structure = createDependencyStructure();
        getModules = structure.init();
        deletedCallback = createSpy(function deletedCallback(module, snapshot) {});

        getModules({"dirA":"dirA"}, function() {}, deletedCallback);

        structure.getDirContentsIsDone();
        structure.sendFileUpdate["dirA"]("aFile.js", true);
        expect(deletedCallback).not.toHaveBeenCalled();
        structure.sendFileUpdate["dirA"]("aFile.js", false);

        expect(deletedCallback).toHaveBeenCalled();
    });

    it("provides addedOrChangedCallback with a snapshot of the moment the file was changed", function (expect) {
        var getModules, structure, addedOrChangedCallback;

        structure = createDependencyStructure();
        getModules = structure.init();
        addedOrChangedCallback = createSpy(function addedOrChangedCallback(module, snapshot) {});

        getModules({"dirA":"dirA"}, addedOrChangedCallback, function() {});
        structure.getDirContentsIsDone();
        structure.sendFileUpdate["dirA"]("aFile.js", true);
        structure.sendFileUpdate["dirA"]("anotherFile.js", true);

        var firstSnapshot = addedOrChangedCallback.calls[0].arg["snapshot"];
        var secondSnapshot = addedOrChangedCallback.calls[1].arg["snapshot"];

        expect(firstSnapshot["aFile.js"]).toBeDefined();
        expect(firstSnapshot["anotherFile.js"]).not.toBeDefined();

        expect(secondSnapshot["aFile.js"]).toBeDefined();
        expect(secondSnapshot["anotherFile.js"]).toBeDefined();
    });
    it("provides deletedCallback with a snapshot of the moment the file was changed", function (expect) {
        var getModules, structure, deletedCallback;

        structure = createDependencyStructure();
        getModules = structure.init();
        deletedCallback = createSpy(function deletedCallback(module, snapshot) {});

        getModules({"dirA":"dirA"}, function() {}, deletedCallback);
        structure.getDirContentsIsDone();
        structure.sendFileUpdate["dirA"]("aFile.js", true);
        structure.sendFileUpdate["dirA"]("anotherFile.js", true);
        
        expect(deletedCallback).not.toHaveBeenCalled();

        structure.sendFileUpdate["dirA"]("anotherFile.js", false);
        structure.sendFileUpdate["dirA"]("aFile.js", false);

        expect(deletedCallback).toHaveBeenCalledWithTheSequence(
            [template({"aFile.js":{}})],
            [{}]
        );
    });
});
---
---
// contract:
//     "()" includeDirs, addedOrChangedCallback, deletedCallback:


// "()" includeDirs, addedOrChangedCallback, deletedCallback:

//     includeDirs <- "for(in)" as dirs
//     dirWatcher <- "()" dirs, dirWatcherCallback as closers
//     getDirContents <- "()" dirs getDirContentsCallback
//     closer as returnvalue

//     {} as cache

//     dirWatcherCallback:
//         "()" path, exists:
//             fileUpdate <- "()" path, exists

//     getDirContentsCallback:
//         "()" path:
//             fileUpdate <- "()" path, boolean

//     fileUpdate:
//         "()" path, exists:
//             path <- ".substr()" integer
//             tryReload:
//                 "()" key, sourcedir, path:
//                     exceptionHandler:
//                         "Error: invalid javascript":
//                         "Error: no define call":

//                     contractModule <- "new()" sourcedir, paths, exceptionHandler as returnvalue <- ".addNamespace()" key
//             tryReload <- "()" namespace, dirs, path as module 
//             cache <- "[]" path, module
//                   <- "delete" path
//                   <- ".hasOwnProperty()" path
//             hashMap as snapshot

//             callback:
//                 "()" path, module:
//                     module <- ".AMDid" as id
//                     snapshot <- "[]" id, module
//             objLoop <- "()" cache callback

//             addedOrChangedCallback <- "()" module snapshot
//             deletedCallback <- "()" snapshot

//     closer:
//         "()":
//             map <- "()" closers mapCallback

//             mapCallback closer:
//                 closer <- "()"
function createSnapshot(cache) {
    var snapshot = {};

    objLoop(cache, function (path, module) {
        if (snapshot.hasOwnProperty(module.AMDid)) {
            throw new Error(path + " has an AMDid (" + module.AMDid + ") that is already defined by " + snapshot[module.AMDid].path);
        }
        snapshot[module.AMDid] = {
            path: path,
            AMDid: module.AMDid,
            dependencies: module.dependencies,
            dependencyVariables: module.dependencyVariables,
            contractText: module.contractText,
            defineFunctionBody: module.defineFunctionBody,
            testFunctionBody: module.testFunctionBody,
            expectations: module.expectations,
            dependants: []
        };
    });
    objLoop(snapshot, function (id, module) {
        map(module.dependencies, function (dep) {
            if (!snapshot.hasOwnProperty(dep)) {
                var hint = "";
                if (dep.substr(-3) === ".js") {
                    hint = "(It ends with .js, dependencies usually don't)";
                }
                console.log("dependency " + dep + " of " + module.path + " was not found. " + hint);
            } else {
                snapshot[dep].dependants.push(id);
            }
        });
    });
    return snapshot;
}

function fileUpdate(cache, path, exists, namespace, sourcedir, addedOrChangedCallback, deletedCallback) {
    var snapshot;
    function doDelete() {
        if (cache.hasOwnProperty(path)) {
            delete cache[path];
            deletedCallback(createSnapshot(cache));
        }
    }
    function doUpdate(module) {
        cache[path] = module;
        addedOrChangedCallback(undefined, cache[path].AMDid, createSnapshot(cache));
    }
    if (exists) {
        loadModule(sourcedir, path, namespace, function (errors, module) {
            if (errors) {
                addedOrChangedCallback(errors);
            } else {
                if (module) {
                    doUpdate(module);
                } else {
                    //The module is identified by all loaders as "not a js module"
                    doDelete();
                }
            }
        });
    } else {
        doDelete();
    }
}

function fileLoad(cache, path, namespace, sourcedir, dir, watchDir) {
    if (path) {
        //addedOrChangedCallback isn't triggered on initial load because the snapshot cannot be relied on yet
        loadModule(sourcedir, path, namespace, function (errors, module) {
            if (module) {
                //at least one loader attempted to load it
                cache[path] = module;
            }
        });
    } else {
        watchDir(dir);
    }

}

function watchDir(namespace, sourcedir, cache, addedOrChangedCallback, deletedCallback) {
    var closers = [];
    function innerWatchDir(dir) {
        closers.push(dirWatcher(dir, function (path, exists) {
            fileUpdate(cache, path, exists, namespace, sourcedir, addedOrChangedCallback, deletedCallback);
        }));
    }
    innerWatchDir(sourcedir);

    getDirContents(
        sourcedir, 
        function (path, dir) {
            fileLoad(cache, path, namespace, sourcedir, dir, innerWatchDir);
        },
        function () {}
    );

    return function () {
        map(closers, function (closer) { closer(); });
    };
}

function getModules(includeDirs, addedOrChangedCallback, deletedCallback) {
    var closers = [],
        cache = {};
    
    objLoop(includeDirs, function (namespace, dir) {
        closers.push(watchDir(namespace, dir, cache, addedOrChangedCallback, deletedCallback));
    });

    return function () {
        map(closers, function (closer) { closer(); });
    };
}
return getModules;