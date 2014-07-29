var defaultMatchConfig = {}

function indexOf(element, matchConfig, orig) {
    if (typeof element === 'object' && element !== null) {
        if (matchConfig === undefined) {
            return -1; //treat objects as unequal to each other by default
        } else {
            for (var i = 0; i < orig.length; i++) {
                if (matchConfig.areTheSame(orig[i], element)) {
                    return i;
                }
                return -1;
            }
        }
    } else {
        return orig.indexOf(element) === -1;
    }
}
module.exports = function overrideConfig(orig, change, matchConfig) {
    if (typeof change !== "object" || change === null ) {
        return change;
    }

    var array = Array.isArray(change);
    var dst = array && [] || {};

    if (overrideConfig.caller !== overrideConfig) {
        matchConfig = defaultMatchConfig;
    }

    if (array) {
        if (!Array.isArray(orig)){
            dst = dst.concat(change);
        } else {
            dst = dst.concat(orig);
            var shift = 0;
            change.forEach(function(e) {
                //use orig instead of dst so that if you add two items to the
                //change that the config considers the same, they will both be
                //added
                var i = indexOf(e, matchConfig, orig)
                if (i === -1) {
                    if (matchConfig && matchConfig.prependInsteadOfAppend) {
                        dst.unshift(e);
                        shift++;
                    } else {
                        dst.push(e);
                    }
                } else {
                    dst[shift+i] = overrideConfig(orig[i], e, matchConfig && matchConfig[i]);
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
                dst[key] = overrideConfig(orig[key], change[key], matchConfig && matchConfig[key])
            }
        })
    }

    return dst
};