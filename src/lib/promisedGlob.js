var when = require("when");

module.exports = function glob(globPattern) {
    return when.promise(function (resolve, reject) {
        glob(globPattern, function (err, jsFiles) {
            if (err) {
                reject(err);
            } else {
                resolve(jsFiles);
            }
        })
    }
};