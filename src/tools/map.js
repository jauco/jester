---
description: The map function for platforms that do not have a native implementation.
dependencies:
    test: richard/non-recursetest
---
---
---
//code from: https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/map
// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.com/#x15.4.4.19

return function map(arr, callback, thisArg) {
    var retVal, i, len;
    if (Array.prototype.map) {
        return Array.prototype.map.apply(arr, Array.prototype.slice.call(arguments, 1));
    } else {
        if (arr == null) {
            throw new TypeError("array is null or not defined");
        }
        // 4. If IsCallable(callback) is false, throw a TypeError exception. (See: http://es5.github.com/#x9.11)
        if (typeof callback !== "function") {
            throw new TypeError(callback + " is not a function");
        }

        // 1. Let O be the result of calling ToObject passing the array as the argument.
        arr = Object(arr);
        // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        len = arr.length*1;

        retVal = new Array(len);
        i = 0;
        while(i < len) {
            var mappedValue;
            if (i in arr) {
                retVal[i] = callback.call(thisArg, arr[i], i, arr);
            }
            i++;
        }
        return retVal;
    }
};