var glob = require("glob");

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
}
