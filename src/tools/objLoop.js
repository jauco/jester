---
description: A variant on the map function that takes care of hasOwnProperty and returns a new object with the results.
---
---
---
return function objLoop(obj, callback) {
    var key, result, temp;
    result = {};
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            //store in temp val so that key can be updated before it's used to assign to result
            temp = callback(key, obj[key], function (newKey) {key = newKey});
            result[key] = temp;
        }
    }
    return result;
}