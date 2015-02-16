"use strict";
var glob = require("glob");
var when = require("when");

module.exports = function globPromise(path, options) {
    return when.promise(function(resolve, reject) {
        glob(path, options, function (err, files) {
            if(err === null) {
                resolve(files);
            }
            else {
                reject(err);
            }
        });
    });
};
