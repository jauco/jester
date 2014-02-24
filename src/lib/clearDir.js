/** @module lib/clearDir*/

var glob = require("glob");

/** removes all *.js files recursively from path and calls cb when finished */
module.exports = function clearDir(path, cb) {
    var files = glob.sync(path + "/**/*.js");
    var total = files.length;
    if (total === 0) {
        cb();
    }
    files.forEach(function (file) {
        require("fs").unlink(file, function removeCompleted() {
            total -= 1;
            if (total === 0) {
                cb();
            }
        });
    });
};
