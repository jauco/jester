---
dependencies:
    fs: tools/node-wrappers/fs
    path: tools/node-wrappers/path
    test: richard/test
    createSpy: richard/createSpy
---
test(__module.AMDid, function (it) {
    function createDependencyStructure() {
        var structure = {
            statResult: [undefined, {
                mtime: 20,
                size: 10
            }],
            fs: {
                watch: createSpy("fs.watch", function (dir, callback) {
                    structure.callback = callback;
                }),
                stat: function (path, callback) {
                    callback.apply(undefined, structure.statResult);
                }
            },
            path: path
        };

        structure.DirWatcher = __module.constructor(structure.fs, structure.path);
        return structure;
    }
    it("sends an event when fs.watch indicates that a file has been updated", function (expect) {
        var structure, result;
        
        structure = createDependencyStructure();
        new structure.DirWatcher("", function (path) {
            result = path;
        });

        structure.callback("change", "somepath");
        expect(result).toEqual("somepath");
    });
    it("will only send events if the mtime is actually newer and the fileSize isn't 0 to prevent duplicate calls on windows", function (expect) {
        var structure, callCount;
        
        structure = createDependencyStructure();
        callCount = 0;
        new structure.DirWatcher("", function (path) {
            callCount += 1;
        });

        structure.callback("change", "somepath");
        expect(callCount).toEqual(1);
        structure.callback("change", "somepath");
        expect(callCount).toEqual(1);
        structure.statResult[1].mtime += 1;
        structure.callback("change", "somepath");
        expect(callCount).toEqual(2);
    });
    it("will call the callback with false if the update is because of a deletion", function (expect) {
        var structure, result;
        
        structure = createDependencyStructure();
        new structure.DirWatcher("", function (path, isDeleted) {
            result = isDeleted;
        });

        structure.statResult = ["file not found"];
        structure.callback("rename", "somepath");
        expect(result).toEqual(false);

        structure.statResult = [undefined, {}];
        structure.callback("rename", "somepath");
        expect(result).toEqual(true);
    });
});
---
---
// "()" dir, callback:
//     dir <- "<absolute path>"
//     callback <- "()" path, boolean
//     closer as returnvalue

//     path:
//         string+
//         "<absolute path>":

//     closer:
//         "()":
function dirWatcher(dir, callback) {
    var mtimes, watcher;

    mtimes = {};
    watcher = fs.watch(dir, function (event, pathOfFile) {
        if (pathOfFile) {//sometimes a rename event is fired with pathOfFile == null I don't know why, so I ignore it.
            pathOfFile = path.join(dir, pathOfFile);
            if (event === "change"){
                //FIXME: stats can be empty when an err
                fs.stat(pathOfFile, function (err, stats) {
                    //side effect is that clearing a file will not trigger an update. I don't mind because an empty
                    //file is not a valid js file anyway, so it will never have any effect on the resulting artifact
                    if ((mtimes[pathOfFile] === undefined || mtimes[pathOfFile] < stats.mtime) && stats.size > 0 ) {
                        mtimes[pathOfFile] = stats.mtime;
                        callback(pathOfFile, true);
                    }
                });
            } else if (event === "rename"){ 
                fs.stat(pathOfFile, function(err, res){
                    if (err){
                        callback(pathOfFile, false);
                    } else {
                        callback(pathOfFile, true);
                    }
                });
            }
        }
    });

    return function () {
        watcher.close();
    };
}

return dirWatcher;