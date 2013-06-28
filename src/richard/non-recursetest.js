---
description: If you include the test modules from the test modules themselves you get a dependency loop. So I keep a pre-concatenated version here
---
---
---
var $tools$47map = (function () {

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
        len = arr.length >>> 0;

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
}());
var $tools$47global = (function () {
return (new Function("return this"))();
}());
var $tools$47rsvp = (function (global) {

var Promise = function(val) {
    this._res = val;

    this._isFulfilled = !!arguments.length;
    this._isRejected = false;

    this._fulfilledCallbacks = [];
    this._rejectedCallbacks = [];
    this._progressCallbacks = [];
};

Promise.prototype = {
    valueOf : function() {
        return this._res;
    },

    isFulfilled : function() {
        return this._isFulfilled;
    },

    isRejected : function() {
        return this._isRejected;
    },

    isResolved : function() {
        return this._isFulfilled || this._isRejected;
    },

    fulfill : function(val) {
        if(this.isResolved()) {
            return;
        }

        this._isFulfilled = true;
        this._res = val;

        this._callCallbacks(this._fulfilledCallbacks, val);
        this._fulfilledCallbacks = this._rejectedCallbacks = this._progressCallbacks = undef;
    },

    reject : function(err) {
        if(this.isResolved()) {
            return;
        }

        this._isRejected = true;
        this._res = err;

        this._callCallbacks(this._rejectedCallbacks, err);
        this._fulfilledCallbacks = this._rejectedCallbacks = this._progressCallbacks = undef;
    },

    notify : function(val) {
        if(this.isResolved()) {
            return;
        }

        this._callCallbacks(this._progressCallbacks, val);
    },

    then : function(onFulfilled, onRejected, onProgress) {
        var promise = new Promise(),
            cb;

        if(!this._isRejected) {
            cb = { promise : promise, fn : onFulfilled };
            this._isFulfilled?
                this._callCallbacks([cb], this._res) :
                this._fulfilledCallbacks.push(cb);
        }

        if(!this._isFulfilled) {
            cb = { promise : promise, fn : onRejected };
            this._isRejected?
                this._callCallbacks([cb], this._res) :
                this._rejectedCallbacks.push(cb);
        }

        this.isResolved() || this._progressCallbacks.push({ promise : promise, fn : onProgress });

        return promise;
    },

    fail : function(onRejected) {
        return this.then(undef, onRejected);
    },

    always : function(onResolved) {
        var _this = this,
            cb = function() {
                return onResolved(_this);
            };

        return this.then(cb, cb);
    },

    progress : function(onProgress) {
        return this.then(undef, undef, onProgress);
    },

    spread : function(onFulfilled, onRejected) {
        return this.then(
            function(val) {
                return onFulfilled.apply(this, val);
            },
            onRejected);
    },

    done : function() {
        this.fail(throwException);
    },

    delay : function(delay) {
        return this.then(function(val) {
            var promise = new Promise();
            setTimeout(
                function() {
                    promise.fulfill(val);
                },
                delay);
            return promise;
        });
    },

    timeout : function(timeout) {
        var promise = new Promise(),
            timer = setTimeout(
                function() {
                    promise.reject(Error('timed out'));
                },
                timeout);

        promise.sync(this);
        promise.always(function() {
            clearTimeout(timer);
        });

        return promise;
    },

    sync : function(promise) {
        var _this = this;
        promise.then(
            function(val) {
                _this.fulfill(val);
            },
            function(err) {
                _this.reject(err);
            });
    },

    _callCallbacks : function(callbacks, arg) {
        var len = callbacks.length;
        if(!len) {
            return;
        }

        var isResolved = this.isResolved(),
            isFulfilled = this.isFulfilled();

        nextTick(function() {
            var i = 0, cb, promise, fn;
            while(i < len) {
                cb = callbacks[i++];
                promise = cb.promise;
                fn = cb.fn;

                if(isFunction(fn)) {
                    var res;
                    try {
                        res = fn(arg);
                    }
                    catch(e) {
                        promise.reject(e);
                        continue;
                    }

                    if(isResolved) {
                        Vow.isPromise(res)?
                            (function(promise) {
                                res.then(
                                    function(val) {
                                        promise.fulfill(val);
                                    },
                                    function(err) {
                                        promise.reject(err);
                                    })
                            })(promise) :
                            promise.fulfill(res);
                    }
                    else {
                        promise.notify(res);
                    }
                }
                else {
                    isResolved?
                        isFulfilled?
                            promise.fulfill(arg) :
                            promise.reject(arg) :
                        promise.notify(arg);
                }
            }
        });
    }
};

var Vow = {
    promise : function(val) {
        return arguments.length?
            this.isPromise(val)?
                val :
                new Promise(val) :
            new Promise();
    },

    when : function(obj, onFulfilled, onRejected, onProgress) {
        return this.promise(obj).then(onFulfilled, onRejected, onProgress);
    },

    fail : function(obj, onRejected) {
        return this.when(obj, undef, onRejected);
    },

    always : function(obj, onResolved) {
        return this.promise(obj).always(onResolved);
    },

    progress : function(obj, onProgress) {
        return this.promise(obj).progress(onProgress);
    },

    spread : function(obj, onFulfilled, onRejected) {
        return this.promise(obj).spread(onFulfilled, onRejected);
    },

    done : function(obj) {
        this.isPromise(obj) && obj.done();
    },

    isPromise : function(obj) {
        return obj && isFunction(obj.then);
    },

    valueOf : function(obj) {
        return this.isPromise(obj)? obj.valueOf() : obj;
    },

    isFulfilled : function(obj) {
        return this.isPromise(obj)? obj.isFulfilled() : true;
    },

    isRejected : function(obj) {
        return this.isPromise(obj)? obj.isRejected() : false;
    },

    isResolved : function(obj) {
        return this.isPromise(obj)? obj.isResolved() : true;
    },

    fulfill : function(val) {
        return this.when(val, undef, function(err) {
            return err;
        });
    },

    reject : function(err) {
        return this.when(err, function(val) {
            var promise = new Promise();
            promise.reject(val);
            return promise;
        });
    },

    resolve : function(val) {
        return this.isPromise(val)? val : this.when(val);
    },

    invoke : function(fn) {
        try {
            return this.promise(fn.apply(null, slice.call(arguments, 1)));
        }
        catch(e) {
            return this.reject(e);
        }
    },

    forEach : function(promises, onFulfilled, onRejected, keys) {
        var len = keys? keys.length : promises.length,
            i = 0;
        while(i < len) {
            this.when(promises[keys? keys[i] : i], onFulfilled, onRejected);
            ++i;
        }
    },

    all : function(promises) {
        var resPromise = new Promise(),
            isPromisesArray = isArray(promises),
            keys = isPromisesArray?
                getArrayKeys(promises) :
                getObjectKeys(promises),
            len = keys.length,
            res = isPromisesArray? [] : {};

        if(!len) {
            resPromise.fulfill(res);
            return resPromise;
        }

        var i = len,
            onFulfilled = function() {
                if(!--i) {
                    var j = 0;
                    while(j < len) {
                        res[keys[j]] = Vow.valueOf(promises[keys[j++]]);
                    }
                    resPromise.fulfill(res);
                }
            },
            onRejected = function(err) {
                resPromise.reject(err);
            };

        this.forEach(promises, onFulfilled, onRejected, keys);

        return resPromise;
    },

    allResolved : function(promises) {
        var resPromise = new Promise(),
            isPromisesArray = isArray(promises),
            keys = isPromisesArray?
                getArrayKeys(promises) :
                getObjectKeys(promises),
            i = keys.length,
            res = isPromisesArray? [] : {};

        if(!i) {
            resPromise.fulfill(res);
            return resPromise;
        }

        var onProgress = function() {
                --i || resPromise.fulfill(promises);
            };

        this.forEach(promises, onProgress, onProgress, keys);

        return resPromise;
    },

    any : function(promises) {
        var resPromise = new Promise(),
            len = promises.length;

        if(!len) {
            resPromise.reject(Error());
            return resPromise;
        }

        var i = 0, err,
            onFulfilled = function(val) {
                resPromise.fulfill(val);
            },
            onRejected = function(e) {
                i || (err = e);
                ++i === len && resPromise.reject(err);
            };

        this.forEach(promises, onFulfilled, onRejected);

        return resPromise;
    },

    delay : function(val, timeout) {
        return this.promise(val).delay(timeout);
    },

    timeout : function(val, timeout) {
        return this.promise(val).timeout(timeout);
    }
};

var undef,
    nextTick = (function() {
        if(typeof process === 'object') { // nodejs
            return process.nextTick;
        }

        if(global.setImmediate) { // ie10
            return global.setImmediate;
        }

        var fns = [],
            callFns = function() {
                var fnsToCall = fns, i = 0, len = fns.length;
                fns = [];
                while(i < len) {
                    fnsToCall[i++]();
                }
            };

        if(global.postMessage) { // modern browsers
            var isPostMessageAsync = true;
            if(global.attachEvent) {
                var checkAsync = function() {
                        isPostMessageAsync = false;
                    };
                global.attachEvent('onmessage', checkAsync);
                global.postMessage('__checkAsync', '*');
                global.detachEvent('onmessage', checkAsync);
            }

            if(isPostMessageAsync) {
                var msg = '__promise' + +new Date,
                    onMessage = function(e) {
                        if(e.data === msg) {
                            e.stopPropagation && e.stopPropagation();
                            callFns();
                        }
                    };

                global.addEventListener?
                    global.addEventListener('message', onMessage, true) :
                    global.attachEvent('onmessage', onMessage);

                return function(fn) {
                    fns.push(fn) === 1 && global.postMessage(msg, '*');
                };
            }
        }

        var doc = global.document;
        if('onreadystatechange' in doc.createElement('script')) { // ie6-ie8
            var createScript = function() {
                    var script = doc.createElement('script');
                    script.onreadystatechange = function() {
                        script.parentNode.removeChild(script);
                        script = script.onreadystatechange = null;
                        callFns();
                };
                (doc.documentElement || doc.body).appendChild(script);
            };

            return function(fn) {
                fns.push(fn) === 1 && createScript();
            };
        }

        return function(fn) { // old browsers
            setTimeout(fn, 0);
        };
    })(),
    throwException = function(e) {
        nextTick(function() {
            throw e;
        });
    },
    isFunction = function(obj) {
        return typeof obj === 'function';
    },
    slice = Array.prototype.slice,
    toStr = Object.prototype.toString,
    isArray = Array.isArray || function(obj) {
        return toStr.call(obj) === '[object Array]';
    },
    getArrayKeys = function(arr) {
        var res = [],
            i = 0, len = arr.length;
        while(i < len) {
            res.push(i++);
        }
        return res;
    },
    getObjectKeys = Object.keys || function(obj) {
        var res = [];
        for(var i in obj) {
            obj.hasOwnProperty(i) && res.push(i);
        }
        return res;
    };

return Vow;
}($tools$47global));
var $tools$47afterAll = (function (map,rsvp) {

function afterAll(array) {
    var promise = rsvp.promise();
    var result = [];
    var toHandle = array.length;

    map(array, function (item, index) {
        function handleItem(item) {
            result[index] = item;
            toHandle--;
            if (toHandle === 0) {
                promise.fulfill(result);
            }
        }

        if (typeof item === 'object' && typeof item.then === 'function') {
            item.always(function (val) { handleItem(item); });
        } else {
            var wrapper = rsvp.promise();
            wrapper.resolve(item);
            handleItem(wrapper);
        }
    });
    return promise;
}

return afterAll;
}($tools$47map,$tools$47rsvp));
var $tools$47reduce = (function () {

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
        len = arr.length >> 0;

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
            retVal = arguments[1];
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
}());
var $jasminum$47results$47NestedResults = (function (map,reduce) {
function NestedResults(groupCaption) {
    this._groupCaption = groupCaption;
    this._results = [];
}

NestedResults.prototype.addResult = function(result) {
    this._results.push(result);
};

NestedResults.prototype.addResults = function(results) {
    this._results = this._results.concat(results);
};

NestedResults.prototype.report = function(hideSuccessfulMessages) {
    var result;
    result = reduce(map(this._results, function(result) {
        return result.report(hideSuccessfulMessages);
    }), function(obj, newVal) {
        obj.failedCount += newVal.failedCount;
        obj.passedCount += newVal.passedCount;
        obj.messages = obj.messages.concat(map(newVal.messages, function(msg) {
            return msg.replace(/^/gm, "  ");
        }));
        return obj;
    }, {
        failedCount: 0,
        passedCount: 0,
        messages: []
    });
    result.messages.unshift(this._groupCaption + " [passed: " + result.passedCount + ", failed: " + result.failedCount + "]");
    return result;
};

return NestedResults;
}($tools$47map,$tools$47reduce));
var $jasminum$47results$47Result = (function () {
function Result(message, passed) {
    this.message = message;
    this.passed = passed;
}

Result.prototype.report = function(hideSuccessfulMessages) {
    var result = {
        failedCount: 0,
        passedCount: 0,
        messages: []
    };
    if (this.passed) {
        result.passedCount = 1;
        if (!hideSuccessfulMessages && typeof this.message === "string" && this.message.trim().length > 0) {
            result.messages.push("[x] " + this.message);
        }
    } else {
        result.failedCount = 1;
        if (typeof this.message === "string" && this.message.trim().length > 0) {
            result.messages.push("[-] " + this.message);
        }
    }
    return result;
};

return Result;
}());
var $jasminum$47expect$47equals = (function () {
var rawEquals;

function objectDiff(actual, expected) {
    var result = {
        changed: "equal",
        value: {}
    }, key;
    if (actual === expected) {
        result.value = actual;
        return result;
    }
    for (key in actual) {
        if (actual.hasOwnProperty(key)) {
            if (typeof actual[key] !== "undefined") {
                if (typeof expected[key] !== "undefined") {
                    result.value[key] = rawEquals(actual[key], expected[key]);
                    if (result.value[key].changed !== "equal") {
                        result.changed = "object change";
                    }
                } else {
                    result.changed = "object change";
                    result.value[key] = {
                        changed: "removed",
                        value: actual[key]
                    };
                }
            }
        }
    }
    for (key in expected) {
        if (expected.hasOwnProperty(key)) {
            if (typeof expected[key] !== "undefined") {
                if (typeof actual[key] === "undefined") {
                    result.changed = "object change";
                    result.value[key] = {
                        changed: "added",
                        value: expected[key]
                    };
                }
            }
        }
    }
    return result;
}

rawEquals = function(actual, expected) {
    var result, message;
    if (actual === expected) {
        result = true;
    } else if (expected && expected.jasmineMatches) {
        result = expected.jasmineMatches(actual);
    } else if (actual instanceof Date && expected instanceof Date) {
        result = actual.getTime() === expected.getTime();
    } else if ((actual instanceof String || typeof actual === "string") && (expected instanceof String || typeof expected === "string")) {
        result = actual.valueOf() === expected.valueOf();
    } else if ((actual instanceof Number || typeof actual === "number") && (expected instanceof Number || typeof expected === "number")) {
        result = actual.valueOf() === expected.valueOf();
    } else if ((actual instanceof Boolean || typeof actual === "boolean") && (expected instanceof Boolean || typeof expected === "boolean")) {
        result = actual.valueOf() === expected.valueOf();
    } else if (typeof actual === "object" && typeof expected === "object") {
        result = objectDiff(actual, expected);
    } else {
        result = false;
    }
    if (result === true) {
        result = {
            changed: "equal",
            value: actual
        };
    }
    if (result === false) {
        result = {
            changed: "primitive change",
            removed: actual,
            added: expected
        };
    }
    return result;
};

return function(actual, expected) {
    return rawEquals(actual, expected).changed === "equal";
};
}());
var $jasminum$47expect$47contains = (function (equals) {
return function contains(haystack, needle) {
    var i;
    if (typeof haystack.indexOf === "function") {
        return !!(haystack.indexOf(needle) > -1);
    }
    for (i = 0; i < haystack.length; i += 1) {
        if (equals(haystack[i], needle)) {
            return true;
        }
    }
    return false;
};
}($jasminum$47expect$47equals));
var $jasminum$47non$45recursetest = (function () {

var $tools$47map = (function () {

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
        len = arr.length >>> 0;

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
}());
var $tools$47global = (function () {
return (new Function("return this"))();
}());
var $tools$47rsvp = (function (global) {

var Promise = function(val) {
    this._res = val;

    this._isFulfilled = !!arguments.length;
    this._isRejected = false;

    this._fulfilledCallbacks = [];
    this._rejectedCallbacks = [];
    this._progressCallbacks = [];
};

Promise.prototype = {
    valueOf : function() {
        return this._res;
    },

    isFulfilled : function() {
        return this._isFulfilled;
    },

    isRejected : function() {
        return this._isRejected;
    },

    isResolved : function() {
        return this._isFulfilled || this._isRejected;
    },

    fulfill : function(val) {
        if(this.isResolved()) {
            return;
        }

        this._isFulfilled = true;
        this._res = val;

        this._callCallbacks(this._fulfilledCallbacks, val);
        this._fulfilledCallbacks = this._rejectedCallbacks = this._progressCallbacks = undef;
    },

    reject : function(err) {
        if(this.isResolved()) {
            return;
        }

        this._isRejected = true;
        this._res = err;

        this._callCallbacks(this._rejectedCallbacks, err);
        this._fulfilledCallbacks = this._rejectedCallbacks = this._progressCallbacks = undef;
    },

    notify : function(val) {
        if(this.isResolved()) {
            return;
        }

        this._callCallbacks(this._progressCallbacks, val);
    },

    then : function(onFulfilled, onRejected, onProgress) {
        var promise = new Promise(),
            cb;

        if(!this._isRejected) {
            cb = { promise : promise, fn : onFulfilled };
            this._isFulfilled?
                this._callCallbacks([cb], this._res) :
                this._fulfilledCallbacks.push(cb);
        }

        if(!this._isFulfilled) {
            cb = { promise : promise, fn : onRejected };
            this._isRejected?
                this._callCallbacks([cb], this._res) :
                this._rejectedCallbacks.push(cb);
        }

        this.isResolved() || this._progressCallbacks.push({ promise : promise, fn : onProgress });

        return promise;
    },

    fail : function(onRejected) {
        return this.then(undef, onRejected);
    },

    always : function(onResolved) {
        var _this = this,
            cb = function() {
                return onResolved(_this);
            };

        return this.then(cb, cb);
    },

    progress : function(onProgress) {
        return this.then(undef, undef, onProgress);
    },

    spread : function(onFulfilled, onRejected) {
        return this.then(
            function(val) {
                return onFulfilled.apply(this, val);
            },
            onRejected);
    },

    done : function() {
        this.fail(throwException);
    },

    delay : function(delay) {
        return this.then(function(val) {
            var promise = new Promise();
            setTimeout(
                function() {
                    promise.fulfill(val);
                },
                delay);
            return promise;
        });
    },

    timeout : function(timeout) {
        var promise = new Promise(),
            timer = setTimeout(
                function() {
                    promise.reject(Error('timed out'));
                },
                timeout);

        promise.sync(this);
        promise.always(function() {
            clearTimeout(timer);
        });

        return promise;
    },

    sync : function(promise) {
        var _this = this;
        promise.then(
            function(val) {
                _this.fulfill(val);
            },
            function(err) {
                _this.reject(err);
            });
    },

    _callCallbacks : function(callbacks, arg) {
        var len = callbacks.length;
        if(!len) {
            return;
        }

        var isResolved = this.isResolved(),
            isFulfilled = this.isFulfilled();

        nextTick(function() {
            var i = 0, cb, promise, fn;
            while(i < len) {
                cb = callbacks[i++];
                promise = cb.promise;
                fn = cb.fn;

                if(isFunction(fn)) {
                    var res;
                    try {
                        res = fn(arg);
                    }
                    catch(e) {
                        promise.reject(e);
                        continue;
                    }

                    if(isResolved) {
                        Vow.isPromise(res)?
                            (function(promise) {
                                res.then(
                                    function(val) {
                                        promise.fulfill(val);
                                    },
                                    function(err) {
                                        promise.reject(err);
                                    })
                            })(promise) :
                            promise.fulfill(res);
                    }
                    else {
                        promise.notify(res);
                    }
                }
                else {
                    isResolved?
                        isFulfilled?
                            promise.fulfill(arg) :
                            promise.reject(arg) :
                        promise.notify(arg);
                }
            }
        });
    }
};

var Vow = {
    promise : function(val) {
        return arguments.length?
            this.isPromise(val)?
                val :
                new Promise(val) :
            new Promise();
    },

    when : function(obj, onFulfilled, onRejected, onProgress) {
        return this.promise(obj).then(onFulfilled, onRejected, onProgress);
    },

    fail : function(obj, onRejected) {
        return this.when(obj, undef, onRejected);
    },

    always : function(obj, onResolved) {
        return this.promise(obj).always(onResolved);
    },

    progress : function(obj, onProgress) {
        return this.promise(obj).progress(onProgress);
    },

    spread : function(obj, onFulfilled, onRejected) {
        return this.promise(obj).spread(onFulfilled, onRejected);
    },

    done : function(obj) {
        this.isPromise(obj) && obj.done();
    },

    isPromise : function(obj) {
        return obj && isFunction(obj.then);
    },

    valueOf : function(obj) {
        return this.isPromise(obj)? obj.valueOf() : obj;
    },

    isFulfilled : function(obj) {
        return this.isPromise(obj)? obj.isFulfilled() : true;
    },

    isRejected : function(obj) {
        return this.isPromise(obj)? obj.isRejected() : false;
    },

    isResolved : function(obj) {
        return this.isPromise(obj)? obj.isResolved() : true;
    },

    fulfill : function(val) {
        return this.when(val, undef, function(err) {
            return err;
        });
    },

    reject : function(err) {
        return this.when(err, function(val) {
            var promise = new Promise();
            promise.reject(val);
            return promise;
        });
    },

    resolve : function(val) {
        return this.isPromise(val)? val : this.when(val);
    },

    invoke : function(fn) {
        try {
            return this.promise(fn.apply(null, slice.call(arguments, 1)));
        }
        catch(e) {
            return this.reject(e);
        }
    },

    forEach : function(promises, onFulfilled, onRejected, keys) {
        var len = keys? keys.length : promises.length,
            i = 0;
        while(i < len) {
            this.when(promises[keys? keys[i] : i], onFulfilled, onRejected);
            ++i;
        }
    },

    all : function(promises) {
        var resPromise = new Promise(),
            isPromisesArray = isArray(promises),
            keys = isPromisesArray?
                getArrayKeys(promises) :
                getObjectKeys(promises),
            len = keys.length,
            res = isPromisesArray? [] : {};

        if(!len) {
            resPromise.fulfill(res);
            return resPromise;
        }

        var i = len,
            onFulfilled = function() {
                if(!--i) {
                    var j = 0;
                    while(j < len) {
                        res[keys[j]] = Vow.valueOf(promises[keys[j++]]);
                    }
                    resPromise.fulfill(res);
                }
            },
            onRejected = function(err) {
                resPromise.reject(err);
            };

        this.forEach(promises, onFulfilled, onRejected, keys);

        return resPromise;
    },

    allResolved : function(promises) {
        var resPromise = new Promise(),
            isPromisesArray = isArray(promises),
            keys = isPromisesArray?
                getArrayKeys(promises) :
                getObjectKeys(promises),
            i = keys.length,
            res = isPromisesArray? [] : {};

        if(!i) {
            resPromise.fulfill(res);
            return resPromise;
        }

        var onProgress = function() {
                --i || resPromise.fulfill(promises);
            };

        this.forEach(promises, onProgress, onProgress, keys);

        return resPromise;
    },

    any : function(promises) {
        var resPromise = new Promise(),
            len = promises.length;

        if(!len) {
            resPromise.reject(Error());
            return resPromise;
        }

        var i = 0, err,
            onFulfilled = function(val) {
                resPromise.fulfill(val);
            },
            onRejected = function(e) {
                i || (err = e);
                ++i === len && resPromise.reject(err);
            };

        this.forEach(promises, onFulfilled, onRejected);

        return resPromise;
    },

    delay : function(val, timeout) {
        return this.promise(val).delay(timeout);
    },

    timeout : function(val, timeout) {
        return this.promise(val).timeout(timeout);
    }
};

var undef,
    nextTick = (function() {
        if(typeof process === 'object') { // nodejs
            return process.nextTick;
        }

        if(global.setImmediate) { // ie10
            return global.setImmediate;
        }

        var fns = [],
            callFns = function() {
                var fnsToCall = fns, i = 0, len = fns.length;
                fns = [];
                while(i < len) {
                    fnsToCall[i++]();
                }
            };

        if(global.postMessage) { // modern browsers
            var isPostMessageAsync = true;
            if(global.attachEvent) {
                var checkAsync = function() {
                        isPostMessageAsync = false;
                    };
                global.attachEvent('onmessage', checkAsync);
                global.postMessage('__checkAsync', '*');
                global.detachEvent('onmessage', checkAsync);
            }

            if(isPostMessageAsync) {
                var msg = '__promise' + +new Date,
                    onMessage = function(e) {
                        if(e.data === msg) {
                            e.stopPropagation && e.stopPropagation();
                            callFns();
                        }
                    };

                global.addEventListener?
                    global.addEventListener('message', onMessage, true) :
                    global.attachEvent('onmessage', onMessage);

                return function(fn) {
                    fns.push(fn) === 1 && global.postMessage(msg, '*');
                };
            }
        }

        var doc = global.document;
        if('onreadystatechange' in doc.createElement('script')) { // ie6-ie8
            var createScript = function() {
                    var script = doc.createElement('script');
                    script.onreadystatechange = function() {
                        script.parentNode.removeChild(script);
                        script = script.onreadystatechange = null;
                        callFns();
                };
                (doc.documentElement || doc.body).appendChild(script);
            };

            return function(fn) {
                fns.push(fn) === 1 && createScript();
            };
        }

        return function(fn) { // old browsers
            setTimeout(fn, 0);
        };
    })(),
    throwException = function(e) {
        nextTick(function() {
            throw e;
        });
    },
    isFunction = function(obj) {
        return typeof obj === 'function';
    },
    slice = Array.prototype.slice,
    toStr = Object.prototype.toString,
    isArray = Array.isArray || function(obj) {
        return toStr.call(obj) === '[object Array]';
    },
    getArrayKeys = function(arr) {
        var res = [],
            i = 0, len = arr.length;
        while(i < len) {
            res.push(i++);
        }
        return res;
    },
    getObjectKeys = Object.keys || function(obj) {
        var res = [];
        for(var i in obj) {
            obj.hasOwnProperty(i) && res.push(i);
        }
        return res;
    };

return Vow;
}($tools$47global));
var $tools$47afterAll = (function (map,rsvp) {

function afterAll(array) {
    var promise = rsvp.promise();
    var result = [];
    var toHandle = array.length;

    map(array, function (item, index) {
        function handleItem(item) {
            result[index] = item;
            toHandle--;
            if (toHandle === 0) {
                promise.fulfill(result);
            }
        }

        if (typeof item === 'object' && typeof item.then === 'function') {
            item.always(function (val) { handleItem(item); });
        } else {
            var wrapper = rsvp.promise();
            wrapper.resolve(item);
            handleItem(wrapper);
        }
    });
    return promise;
}

return afterAll;
}($tools$47map,$tools$47rsvp));
var $tools$47reduce = (function () {

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
        len = arr.length >> 0;

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
            retVal = arguments[1];
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
}());
var $jasminum$47results$47NestedResults = (function (map,reduce) {
function NestedResults(groupCaption) {
    this._groupCaption = groupCaption;
    this._results = [];
}

NestedResults.prototype.addResult = function(result) {
    this._results.push(result);
};

NestedResults.prototype.addResults = function(results) {
    this._results = this._results.concat(results);
};

NestedResults.prototype.report = function(hideSuccessfulMessages) {
    var result;
    result = reduce(map(this._results, function(result) {
        return result.report(hideSuccessfulMessages);
    }), function(obj, newVal) {
        obj.failedCount += newVal.failedCount;
        obj.passedCount += newVal.passedCount;
        obj.messages = obj.messages.concat(map(newVal.messages, function(msg) {
            return msg.replace(/^/gm, "  ");
        }));
        return obj;
    }, {
        failedCount: 0,
        passedCount: 0,
        messages: []
    });
    result.messages.unshift(this._groupCaption + " [passed: " + result.passedCount + ", failed: " + result.failedCount + "]");
    return result;
};

return NestedResults;
}($tools$47map,$tools$47reduce));
var $jasminum$47results$47Result = (function () {
function Result(message, passed) {
    this.message = message;
    this.passed = passed;
}

Result.prototype.report = function(hideSuccessfulMessages) {
    var result = {
        failedCount: 0,
        passedCount: 0,
        messages: []
    };
    if (this.passed) {
        result.passedCount = 1;
        if (!hideSuccessfulMessages && typeof this.message === "string" && this.message.trim().length > 0) {
            result.messages.push("[x] " + this.message);
        }
    } else {
        result.failedCount = 1;
        if (typeof this.message === "string" && this.message.trim().length > 0) {
            result.messages.push("[-] " + this.message);
        }
    }
    return result;
};

return Result;
}());
var $jasminum$47expect$47equals = (function () {
var rawEquals;

function objectDiff(actual, expected) {
    var result = {
        changed: "equal",
        value: {}
    }, key;
    if (actual === expected) {
        result.value = actual;
        return result;
    }
    for (key in actual) {
        if (actual.hasOwnProperty(key)) {
            if (typeof actual[key] !== "undefined") {
                if (typeof expected[key] !== "undefined") {
                    result.value[key] = rawEquals(actual[key], expected[key]);
                    if (result.value[key].changed !== "equal") {
                        result.changed = "object change";
                    }
                } else {
                    result.changed = "object change";
                    result.value[key] = {
                        changed: "removed",
                        value: actual[key]
                    };
                }
            }
        }
    }
    for (key in expected) {
        if (expected.hasOwnProperty(key)) {
            if (typeof expected[key] !== "undefined") {
                if (typeof actual[key] === "undefined") {
                    result.changed = "object change";
                    result.value[key] = {
                        changed: "added",
                        value: expected[key]
                    };
                }
            }
        }
    }
    return result;
}

rawEquals = function(actual, expected) {
    var result, message;
    if (actual === expected) {
        result = true;
    } else if (expected && expected.jasmineMatches) {
        result = expected.jasmineMatches(actual);
    } else if (actual instanceof Date && expected instanceof Date) {
        result = actual.getTime() === expected.getTime();
    } else if ((actual instanceof String || typeof actual === "string") && (expected instanceof String || typeof expected === "string")) {
        result = actual.valueOf() === expected.valueOf();
    } else if ((actual instanceof Number || typeof actual === "number") && (expected instanceof Number || typeof expected === "number")) {
        result = actual.valueOf() === expected.valueOf();
    } else if ((actual instanceof Boolean || typeof actual === "boolean") && (expected instanceof Boolean || typeof expected === "boolean")) {
        result = actual.valueOf() === expected.valueOf();
    } else if (typeof actual === "object" && typeof expected === "object") {
        result = objectDiff(actual, expected);
    } else {
        result = false;
    }
    if (result === true) {
        result = {
            changed: "equal",
            value: actual
        };
    }
    if (result === false) {
        result = {
            changed: "primitive change",
            removed: actual,
            added: expected
        };
    }
    return result;
};

return function(actual, expected) {
    return rawEquals(actual, expected).changed === "equal";
};
}());
var $jasminum$47expect$47contains = (function (equals) {
return function contains(haystack, needle) {
    var i;
    if (typeof haystack.indexOf === "function") {
        return !!(haystack.indexOf(needle) > -1);
    }
    for (i = 0; i < haystack.length; i += 1) {
        if (equals(haystack[i], needle)) {
            return true;
        }
    }
    return false;
};
}($jasminum$47expect$47equals));
var $jasminum$47expect$47prettyPrint = (function (contains,global) {

//max complexity higher because it's a flat case-switch lost
/* jshint maxcomplexity: 20 */
//HTMLElement is checked for using typeof, this won't error if the variable isn't defined 
/* globals HTMLElement */
function prettyPrint_recursive(value, nestLevel, printedObjects) {
    var result,
        i;
    if (nestLevel > 20) {
        result = "<...>";
    } else if (typeof value === "undefined") {
        result = 'undefined';
    } else if (value === null) {
        result = 'null';
    } else if (value === global) {
        result = '<global>';
    } else if (typeof value === 'string' || value instanceof String) {
        result = JSON.stringify(value);
    } else if (value instanceof Function && !value.hasOwnProperty("toString")) {
        result = 'function ' + value.name + "() { ... }";
    } else if (typeof HTMLElement !== "undefined" && value instanceof HTMLElement) {
        result = value.outerHTML;
    } else if (value instanceof Date) {
        result = 'Date(' + value.toLocaleDateString() + " " + value.toLocaleTimeString() + ')';
    } else if (contains(printedObjects, value)) {
        result = '<circular reference: ' + (value instanceof Array ? 'Array' : 'Object') + '>';
    } else if (value instanceof Array) {
        result = "[";
        for (i = 0; i < value.length; i += 1) {
            if (i > 0) {
                result += ', ';
            }
            result += prettyPrint_recursive(value[i], nestLevel + 1, printedObjects.concat(value));
        }
        result += "]";
    } else if (typeof value === 'object') {
        if (value.hasOwnProperty("toString") || (value.constructor !== Object && value.constructor.prototype.hasOwnProperty("toString"))) {
            result = value.toString();
        } else {
            var keys = Object.keys(value);
            result = "{";
            for (i = 0; i < keys.length; i += 1) {
                if (i > 0) {
                    result += ', ';
                }
                result += keys[i] + ": ";
                if (typeof value.__lookupGetter__ === "function" && value.__lookupGetter__(keys[i])) {
                    result += "<getter>";
                }
                result += prettyPrint_recursive(value[keys[i]], nestLevel + 1, printedObjects.concat(value));
            }
            result += "}";
        }
    } else {
        result = value.toString();
    }
    return result;
}
function prettyPrint(value) {
    return prettyPrint_recursive(value, 0, []);
}
return prettyPrint;
}($jasminum$47expect$47contains,$tools$47global));
var $jasminum$47expect$47expectFactory = (function (prettyPrint,Result,equals,contains) {
function initMatcher(expectation, matcherName, matcherFunction) {
    expectation[matcherName] = function() {
        var result = matcherFunction.apply(expectation, arguments), message, englishyPredicate, i, argumentsAsArray = Array.prototype.slice.call(arguments);
        if (expectation.isNot) {
            result = !result;
        }
        if (!result) {
            if (expectation.message) {
                message = expectation.message.apply(expectation, arguments);
                if (message instanceof Array) {
                    message = message[expectation.isNot ? 1 : 0];
                }
            } else {
                englishyPredicate = matcherName.replace(/[A-Z]/g, function(s) {
                    return " " + s.toLowerCase();
                });
                message = "Expected: \n" + prettyPrint(expectation.actual) + "\n" + (expectation.isNot ? " not " : " ") + englishyPredicate + "\n";
                for (i = 0; i < arguments.length; i += 1) {
                    if (i > 0) {
                        message += ", ";
                    }
                    message += prettyPrint(arguments[i]);
                }
                message += ".";
            }
        }
        expectation.results.addResult(new Result(message, result));
    };
}

var defaultMatchers = {
    toBe: function(expected) {
        return this.actual === expected;
    },
    toEqual: function(expected) {
        return equals(this.actual, expected);
    },
    toBeDefined: function() {
        return this.actual !== undefined;
    },
    toMatch: function(expected) {
        return (new RegExp(expected)).test(this.actual);
    },
    toBeTruthy: function() {
        return !!this.actual;
    },
    toBeFalsy: function() {
        return !this.actual;
    },
    toContain: function(expected) {
        return contains(this.actual, expected);
    },
    toBeLessThan: function(expected) {
        return this.actual < expected;
    },
    toBeGreaterThan: function(expected) {
        return this.actual > expected;
    },
    toThrow: function(expected) {
        var exception, result;
        if (typeof this.actual !== "function") {
            result = false;
            this.message = function() {
                return "the action must be wrapped in a function for this to work i.e. expect(function () {someArray[20] += 1}).toThrow()";
            };
        } else {
            this.message = function() {
                var message = "Expected function ", expectedException = expected ? "'" + (expected.message || expected) + "'" : "an exception";
                if (this.isNot) {
                    message += "not ";
                }
                message += "to throw " + expectedException;
                if (exception) {
                    message += ", but it threw '" + (exception.message || exception) + "'";
                } else {
                    message += ".";
                }
                return message;
            };
            try {
                this.actual();
            } catch (e) {
                exception = e;
            }
            if (exception) {
                if (arguments.length === 0) {
                    result = true;
                } else {
                    result = equals(exception.message || exception, expected.message || expected);
                }
            } else {
                result = false;
            }
        }
        return result;
    }
};

function Expectation(actual, customMatchers, results, expectFunc, asNotExpectation) {
    var matcherName;
    this.actual = actual;
    this.isNot = asNotExpectation;
    this.results = results;
    this.expect = expectFunc;
    for (matcherName in defaultMatchers) {
        if (defaultMatchers.hasOwnProperty(matcherName)) {
            initMatcher(this, matcherName, defaultMatchers[matcherName]);
        }
    }
    for (matcherName in customMatchers) {
        if (customMatchers.hasOwnProperty(matcherName)) {
            initMatcher(this, matcherName, customMatchers[matcherName]);
        }
    }
    if (!asNotExpectation) {
        this.not = new Expectation(actual, customMatchers, results, expectFunc, true);
    }
}

function expectFactory(results) {
    var customMatchers = {};
    function expect(actual) {
        var id, tempMatchers = {};
        for (id in customMatchers) {
            if (customMatchers.hasOwnProperty(id)) {
                tempMatchers[id] = customMatchers[id];
            }
        }
        if (actual !== undefined && actual !== null && typeof actual.expectMatchers === "object") {
            for (id in actual.expectMatchers) {
                if (actual.expectMatchers.hasOwnProperty(id)) {
                    tempMatchers[id] = actual.expectMatchers[id];
                }
            }
        }
        return new Expectation(actual, tempMatchers, results, expect);
    }
    expect.addMatcher = function(name, matcher) {
        customMatchers[name] = matcher;
    };
    return expect;
}

expectFactory.defaultMatchers = defaultMatchers;

return expectFactory;
}($jasminum$47expect$47prettyPrint,$jasminum$47results$47Result,$jasminum$47expect$47equals,$jasminum$47expect$47contains));
var $jasminum$47specs$47It = (function (rsvp,expectFactory,Result,NestedResults) {
function It(description, func) {
    this.description = description;
    this.func = func;
}

It.prototype.execute = function() {
    var results, funcResult, promise = rsvp.promise();
    if (typeof this.func === "function") {
        try {
            results = new NestedResults(this.description);
            funcResult = this.func(expectFactory(results), promise);
            if (funcResult === promise) {
                promise = promise.then(function() {
                    return results;
                });
            } else {
                promise.fulfill(results);
            }
        } catch (e) {
            promise.reject(e);
        }
    } else {
        promise.fulfill(new Result("This item is not yet implemented.", false));
    }
    return promise;
};

return It;
}($tools$47rsvp,$jasminum$47expect$47expectFactory,$jasminum$47results$47Result,$jasminum$47results$47NestedResults));
var $jasminum$47specs$47Spec = (function (afterAll,NestedResults,Result,It,map) {
function Spec(description, specDefinitions) {
    var self = this;
    this.description = description;
    this._queue = [];
    specDefinitions(function it(desc, testFunc) {
        self._queue.push(new It(desc, testFunc));
    });
}

Spec.prototype.execute = function() {
    var self = this;
    var its = map(this._queue, function(it) {
        return it.execute();
    });
    return afterAll(its).then(function(itResults) {
        var specResults = new NestedResults(self.description);
        map(itResults, function(itResult) {
            if (itResult.isFulfilled()) {
                specResults.addResult(itResult.valueOf());
            } else {
                specResults.addResult(new Result(itResult.valueOf().stack, false));
            }
        });
        return specResults;
    });
};

return Spec;
}($tools$47afterAll,$jasminum$47results$47NestedResults,$jasminum$47results$47Result,$jasminum$47specs$47It,$tools$47map));
var $jasminum$47test = (function (Spec) {

function test(name, specDefinitions) {
    var spec = new Spec("Tests for " + name, specDefinitions);
    spec.execute().then(
        function (result) {
            result = result.report(false);
            resultCallback(result.failedCount === 0, result.messages);
        },
        function (error) {
            resultCallback(false, [error.stack]);
        }
    );
}
return test;
}($jasminum$47specs$47Spec));

return $jasminum$47test;
}());
var $jasminum$47expect$47prettyPrint = (function (contains,global,test) {

//max complexity higher because it's a flat case-switch lost
/* jshint maxcomplexity: 20 */
//HTMLElement is checked for using typeof, this won't error if the variable isn't defined 
/* globals HTMLElement */
function prettyPrint_recursive(value, nestLevel, printedObjects) {
    var result,
        i;
    if (nestLevel > 20) {
        result = "<...>";
    } else if (typeof value === "undefined") {
        result = 'undefined';
    } else if (value === null) {
        result = 'null';
    } else if (value === global) {
        result = '<global>';
    } else if (typeof value === 'string' || value instanceof String) {
        result = JSON.stringify(value);
    } else if (value instanceof Function && !value.hasOwnProperty("toString")) {
        result = 'function ' + value.name + "() { ... }";
    } else if (typeof HTMLElement !== "undefined" && value instanceof HTMLElement) {
        result = value.outerHTML;
    } else if (value instanceof Date) {
        result = 'Date(' + value.toLocaleDateString() + " " + value.toLocaleTimeString() + ')';
    } else if (contains(printedObjects, value)) {
        result = '<circular reference: ' + (value instanceof Array ? 'Array' : 'Object') + '>';
    } else if (value instanceof Array) {
        result = "[";
        for (i = 0; i < value.length; i += 1) {
            if (i > 0) {
                result += ', ';
            }
            result += prettyPrint_recursive(value[i], nestLevel + 1, printedObjects.concat([value]));
        }
        result += "]";
    } else if (typeof value === 'object') {
        if (value.hasOwnProperty("toString") || (value.constructor !== Object && value.constructor.prototype.hasOwnProperty("toString"))) {
            result = value.toString();
        } else {
            var keys = Object.keys(value);
            result = "{";
            for (i = 0; i < keys.length; i += 1) {
                if (i > 0) {
                    result += ', ';
                }
                result += keys[i] + ": ";
                if (typeof value.__lookupGetter__ === "function" && value.__lookupGetter__(keys[i])) {
                    result += "<getter>";
                }
                result += prettyPrint_recursive(value[keys[i]], nestLevel + 1, printedObjects.concat([value]));
            }
            result += "}";
        }
    } else {
        result = value.toString();
    }
    return result;
}
function prettyPrint(value) {
    return prettyPrint_recursive(value, 0, []);
}
return prettyPrint;
}($jasminum$47expect$47contains,$tools$47global,$jasminum$47non$45recursetest));
var $jasminum$47expect$47expectFactory = (function (prettyPrint,Result,equals,contains) {
function initMatcher(expectation, matcherName, matcherFunction) {
    expectation[matcherName] = function() {
        var result = matcherFunction.apply(expectation, arguments), message, englishyPredicate, i, argumentsAsArray = Array.prototype.slice.call(arguments);
        if (expectation.isNot) {
            result = !result;
        }
        if (!result) {
            if (expectation.message) {
                message = expectation.message.apply(expectation, arguments);
                if (message instanceof Array) {
                    message = message[expectation.isNot ? 1 : 0];
                }
            } else {
                englishyPredicate = matcherName.replace(/[A-Z]/g, function(s) {
                    return " " + s.toLowerCase();
                });
                message = "Expected: \n" + prettyPrint(expectation.actual) + "\n" + (expectation.isNot ? " not " : " ") + englishyPredicate + "\n";
                for (i = 0; i < arguments.length; i += 1) {
                    if (i > 0) {
                        message += ", ";
                    }
                    message += prettyPrint(arguments[i]);
                }
                message += ".";
            }
        }
        expectation.results.addResult(new Result(message, result));
    };
}

var defaultMatchers = {
    toBe: function(expected) {
        return this.actual === expected;
    },
    toEqual: function(expected) {
        return equals(this.actual, expected);
    },
    toBeDefined: function() {
        return this.actual !== undefined;
    },
    toMatch: function(expected) {
        return (new RegExp(expected)).test(this.actual);
    },
    toBeTruthy: function() {
        return !!this.actual;
    },
    toBeFalsy: function() {
        return !this.actual;
    },
    toContain: function(expected) {
        return contains(this.actual, expected);
    },
    toBeLessThan: function(expected) {
        return this.actual < expected;
    },
    toBeGreaterThan: function(expected) {
        return this.actual > expected;
    },
    toThrow: function(expected) {
        var exception, result;
        if (typeof this.actual !== "function") {
            result = false;
            this.message = function() {
                return "the action must be wrapped in a function for this to work i.e. expect(function () {someArray[20] += 1}).toThrow()";
            };
        } else {
            this.message = function() {
                var message = "Expected function ", expectedException = expected ? "'" + (expected.message || expected) + "'" : "an exception";
                if (this.isNot) {
                    message += "not ";
                }
                message += "to throw " + expectedException;
                if (exception) {
                    message += ", but it threw '" + (exception.message || exception) + "'";
                } else {
                    message += ".";
                }
                return message;
            };
            try {
                this.actual();
            } catch (e) {
                exception = e;
            }
            if (exception) {
                if (arguments.length === 0) {
                    result = true;
                } else {
                    result = equals(exception.message || exception, expected.message || expected);
                }
            } else {
                result = false;
            }
        }
        return result;
    }
};

function Expectation(actual, customMatchers, results, expectFunc, asNotExpectation) {
    var matcherName;
    this.actual = actual;
    this.isNot = asNotExpectation;
    this.results = results;
    this.expect = expectFunc;
    for (matcherName in defaultMatchers) {
        if (defaultMatchers.hasOwnProperty(matcherName)) {
            initMatcher(this, matcherName, defaultMatchers[matcherName]);
        }
    }
    for (matcherName in customMatchers) {
        if (customMatchers.hasOwnProperty(matcherName)) {
            initMatcher(this, matcherName, customMatchers[matcherName]);
        }
    }
    if (!asNotExpectation) {
        this.not = new Expectation(actual, customMatchers, results, expectFunc, true);
    }
}

function expectFactory(results) {
    var customMatchers = {};
    function expect(actual) {
        var id, tempMatchers = {};
        for (id in customMatchers) {
            if (customMatchers.hasOwnProperty(id)) {
                tempMatchers[id] = customMatchers[id];
            }
        }
        if (actual !== undefined && actual !== null && typeof actual.expectMatchers === "object") {
            for (id in actual.expectMatchers) {
                if (actual.expectMatchers.hasOwnProperty(id)) {
                    tempMatchers[id] = actual.expectMatchers[id];
                }
            }
        }
        return new Expectation(actual, tempMatchers, results, expect);
    }
    expect.addMatcher = function(name, matcher) {
        customMatchers[name] = matcher;
    };
    return expect;
}

expectFactory.defaultMatchers = defaultMatchers;

return expectFactory;
}($jasminum$47expect$47prettyPrint,$jasminum$47results$47Result,$jasminum$47expect$47equals,$jasminum$47expect$47contains));
var $jasminum$47specs$47It = (function (rsvp,expectFactory,Result,NestedResults) {
function It(description, func) {
    this.description = description;
    this.func = func;
}

It.prototype.execute = function() {
    var results, funcResult, promise = rsvp.promise();
    if (typeof this.func === "function") {
        try {
            results = new NestedResults(this.description);
            funcResult = this.func(expectFactory(results), promise);
            if (funcResult === promise) {
                promise = promise.then(function() {
                    return results;
                });
            } else {
                promise.fulfill(results);
            }
        } catch (e) {
            promise.reject(e);
        }
    } else {
        promise.fulfill(new Result("This item is not yet implemented.", false));
    }
    return promise;
};

return It;
}($tools$47rsvp,$jasminum$47expect$47expectFactory,$jasminum$47results$47Result,$jasminum$47results$47NestedResults));
var $jasminum$47specs$47Spec = (function (afterAll,NestedResults,Result,It,map) {
function Spec(description, specDefinitions) {
    var self = this;
    this.description = description;
    this._queue = [];
    specDefinitions(function it(desc, testFunc) {
        self._queue.push(new It(desc, testFunc));
    }, function spec(desc, specDefinitions) {
        self._queue.push(new Spec(desc, specDefinitions));
    });
}

Spec.prototype.execute = function() {
    var self = this;
    var its = map(this._queue, function(it) {
        return it.execute();
    });
    return afterAll(its).then(function(itResults) {
        var specResults = new NestedResults(self.description);
        map(itResults, function(itResult) {
            if (itResult.isFulfilled()) {
                specResults.addResult(itResult.valueOf());
            } else {
                specResults.addResult(new Result(itResult.valueOf().stack, false));
            }
        });
        return specResults;
    });
};

return Spec;
}($tools$47afterAll,$jasminum$47results$47NestedResults,$jasminum$47results$47Result,$jasminum$47specs$47It,$tools$47map));
var $jasminum$47test = (function (Spec) {

function test(name, specDefinitions) {
    var spec = new Spec(name, specDefinitions);
    spec.execute().then(
        function (result) {
            result = result.report(false);
            resultCallback(result.failedCount === 0, result.messages);
        },
        function (error) {
            resultCallback(false, [error.stack]);
        }
    );
}
return test;
}($jasminum$47specs$47Spec));

return $jasminum$47test;