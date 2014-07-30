module.exports = function overrideConfig(orig, change) {
    if (typeof change !== "object" || change === null ) {
        return change;
    }

    var array = Array.isArray(change);
    var dst = array && [] || {};

    if (array) {
        if (!Array.isArray(orig)){
            dst = dst.concat(change);
        } else {
            dst = dst.concat(orig);
            var shift = 0;
            change.forEach(function(e) {
                if (typeof e === "object" && e !== null) {
                    //no de-duplication for objects
                    dst.push(e);
                } else {
                    //use orig instead of dst so that if you add two items to the
                    //change that the config considers the same, they will both be
                    //added
                    if (orig.indexOf(e) === -1) {
                        dst.push(e);
                    }
                }
            });
        }
    } else {
        if (orig && typeof orig === 'object') {
            Object.keys(orig).forEach(function (key) {
                dst[key] = orig[key]
            })
        }
        Object.keys(change).forEach(function (key) {
            if (!orig[key]) {
                dst[key] = change[key]
            } else {
                dst[key] = overrideConfig(orig[key], change[key])
            }
        })
    }

    return dst
};