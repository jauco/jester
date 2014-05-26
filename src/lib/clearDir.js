var glob = require("../lib/globPromise");
var when = require("when");
var node = require("when/node");

module.exports = function clearDir(path) {
    var unlink = node.lift(require("fs").unlink);

    return glob(path + "/**/*.{js,js.map}")
        .then(function(files) {
            return when.map(files, unlink);
        });
};