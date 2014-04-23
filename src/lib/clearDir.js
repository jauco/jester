var glob = require("../lib/globPromise");
var when = require("when");
var node = require("when/node");

//var fs = require("fs");

// function unlink(file) {
//     var fileDeletion = when.defer();
    
//     fs.unlink(file, function(err) {
//         if(err) {
//             fileDeletion.reject(err);
//         }
//         else {
//             console.log("deleted: ", file)
//             fileDeletion.resolve(file);
//         }
//     });
//     return fileDeletion.promise;
// }

module.exports = function clearDir(path) {
    var unlink = node.lift(require("fs").unlink);

    return glob(path + "/**/*.{js,js.map}").
        then(function(files) {
            return when.map(files, unlink);
        });
};