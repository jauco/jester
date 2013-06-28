---
description: implementation of javascript's filter method for js platforms that don't have a native implementation.
---
---
---
return function filter(arr, filterfunc) {
    var retVal, i, len;
    if (Array.prototype.filter) {
        return Array.prototype.filter.apply(arr, Array.prototype.slice.call(arguments, 1));
    } else {
        if (arr == null) {
            throw new TypeError("array is null or not defined");
        }
        if (typeof filterfunc !== "function") {
            throw new TypeError(filterfunc + " is not a function");
        }

        // 1. Let O be the result of calling ToObject passing the array as the argument.
        arr = Object(arr);
        // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        len = arr.length >>> 0;

        retVal = new Array(len);
        i = 0;
        while(i < len) {
            var mappedValue;
            if (i in arr && filterfunc(arr[i], i, arr)) {
                retVal[i] = arr[i];
            }
            i++;
        }
        return retVal;
    }
};