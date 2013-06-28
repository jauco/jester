---
description: The reduce function for platforms that do not have a native implementation.
---
---
---
//code from: https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/reduce
return function reduce(arr, accumulator, startValue) {
    var i, len, retVal;
    if (Array.prototype.reduce) {
        return Array.prototype.reduce.apply(arr, Array.prototype.slice.call(arguments, 1));
    } else {
        if (arr == null) {
            throw new TypeError("Array is null or undefined");
        }
        i = 0;
        len = arr.length*1;

        if (typeof accumulator !== "function") {
            throw new TypeError("First argument is not callable");
        }
        if(arguments.length < 3) {
            if (len === 0) {
                throw new TypeError("Array length is 0 and no second argument");
            } else {
                // start accumulating at the second element
                retVal = arr[0];
                i = 1; 
            }
        } else {
            retVal = arguments[2];
        }
        while (i < len) {
            if(i in arr) {
                retVal = accumulator(retVal, arr[i], i, arr);
            }
            i += 1;
        }
        return retVal;
    }
};