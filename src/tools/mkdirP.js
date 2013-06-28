---
description: make a directory and if necessary the parent directories as well.
expects:
    require: http://nodejs.org/api/modules.html
    _fs: http://nodejs.org/api/fs.html
    _path: http://nodejs.org/api/path.html
---
---
---
var path = require('path');
var fs = require('fs');

function mkdirP(dirPath, callback) {
    fs.mkdir(dirPath, function (mkdirError) {
        if (mkdirError == null) {
            callback(undefined, dirPath);
        } else {
            if (mkdirError.code === 'ENOENT') {
                mkdirP(path.dirname(dirPath), function (unsolvableError) {
                    if (unsolvableError) {
                        callback(unsolvableError, dirPath);
                    }
                    else {
                        fs.mkdir(dirPath, function (err) {
                            //ignore it if the dir already exists
                            if (err && err.code === "EEXIST") {
                                callback(undefined, dirPath);
                            } else {
                                callback(err, dirPath);
                            }
                        });
                    }
                });
            } else if (mkdirError.code === 'EEXIST') {
                callback(undefined, dirPath);
            } else {
                //unsolvable
                callback(mkdirError, dirPath);
            }
        }
    });
}

return mkdirP;