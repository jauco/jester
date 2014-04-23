var glob = require("glob");
var when = require("when");

module.exports = function globPromise(path, options) {
    return when.promise(function(resolve, reject) {
        glob(path, options, function (er, files) {
            if(er === null) {
                resolve(files);
            }
            else {
                reject(er);
            }
        });
    });
};