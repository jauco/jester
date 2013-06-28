---
dependencies:
    map: tools/map
---
    function (runner, createSpy) {
        var ct, moduleCtor = this.constructor;
        if (this.inclusionReason["main module"]) {
            runner.addSpec(this.AMDid, function (it) {
                function createDependencyStructure() {
                    var structure = {};
                    structure.dirStructure = {};
                    function getFakeFsItem(path) {
                        var result, item;
                        path = path.split("\\");
                        
                        result = structure.dirStructure;
                        for (item in path) {
                            if (path[item].length > 0) {
                                result = result[path[item]];
                            }
                        }
                        
                        return result;
                    }
                    structure.fs = {
                        readdirSync: function (path) {
                            return Object.keys(getFakeFsItem(path));
                        },
                        readFileSync: function (path, encoding) {
                            return getFakeFsItem(path);
                        },
                        statSync: function (path) {
                            return {
                                isDirectory: function () {return typeof getFakeFsItem(path) === "object";}
                            };
                        }
                    };
                    structure.path = { 
                        join: function () {
                            return Array.prototype.slice.call(arguments)
                                .map(function(elm) { return (elm.substr(-1) === "\\" ? elm.substr(0, elm.length-1) : elm); })
                                .join("\\");
                        } 
                    };
                    structure.getDirContents = moduleCtor(structure.fs, structure.path);
                    return structure;
                }

                it("returns an array with absolute paths for all contents of the folder and its subfolders", function (expect) {
                    var result, structure = createDependencyStructure();

                    structure.dirStructure = {
                        "myDir": {
                            "a directory": {
                                "a file": "contents of 'a file'",
                                "a subdirectory": {
                                    "a subdirectory's file": "contents of 'a subdirectory's file'",
                                },
                            },
                            "a toplevel file": "contents of 'a toplevel file'",
                            "an empty directory": {}
                        }
                    };

                    //invoke
                    result = structure.getDirContents("myDir");
                    //assert
                    expect(result).toEqual([
                        {path: 'myDir\\a directory\\a file', contents: "contents of 'a file'"},
                        {path: 'myDir\\a directory\\a subdirectory\\a subdirectory\'s file', contents: "contents of 'a subdirectory's file'"},
                        {path: 'myDir\\a toplevel file', contents: "contents of 'a toplevel file'"},
                    ]);
                });

                it("works with dirs that end on a \\ and dirs that don't", function (expect) {
                    var resultsWithSlash, resultsWithoutSlash;
                    var structure = createDependencyStructure();
                    
                    structure.dirStructure = {
                        "myDir": {
                            "a file": "contents",
                        }
                    };

                    //invoke
                    resultsWithSlash = structure.getDirContents("myDir\\");
                    resultsWithoutSlash = structure.getDirContents("myDir");
                    
                    //assert
                    expect(resultsWithSlash).toEqual(resultsWithoutSlash);
                    expect(resultsWithSlash).toEqual([
                        {path: 'myDir\\a file', contents: "contents"}
                    ])
                });

                //FIXME: add unittest for the error handling
            });
        }
        ct = runner.contract;
        this.contract = ct(this.AMDid, [], {
            "()": function (dir) {
                dir.send("<is string>?");
                dir.send("<absolute path>");
                return ct("getDirContents' return value", [], {
                    "for(i)": ct.str.extend("path", [], {"<absolute path>": ct.undef})
                });
            }
        });
---
---
var fs = require('fs');
var path = require('path');
function getDirContents(dirPath, callback, doneCallback) {
    fs.readdir(dirPath, function (err, dirEntries) {
        function anotherOneDone() {
            filesToHandle -= 1;
            if (filesToHandle === 0) {
                doneCallback();
            }
        }
        if (err != null) {
            console.log(err);
        } else {
            var i, filesToHandle;
            filesToHandle = dirEntries.length;
            map(dirEntries, function(entry) {
                var filePath = path.join(dirPath, entry);
                fs.stat(filePath, function (err, stats) {
                    if (stats && stats.isDirectory()) {
                        callback(null, filePath);
                        getDirContents(filePath, callback, anotherOneDone);
                    } else {
                        callback(filePath, null);
                        anotherOneDone();
                    }
                });
            });
        }
    });
}

return getDirContents;