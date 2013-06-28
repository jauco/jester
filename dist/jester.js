(function() {
"use strict";
var $richard$47non$45recursetest = (function () {

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
}());
var $tools$47map = (function (test) {

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
}($richard$47non$45recursetest));
var $tools$47node$45wrappers$47path = (function () {

return require("path");
}());
var $tools$47node$45wrappers$47console = (function () {

return console;
}());
var $tools$47global = (function () {

/*jshint evil:true*/

// To be cross compatible across different js platforms you need a way to access the global object (i.e. the window
// object in the browser). This can usually be achieved by returning "this" from a function that is not called as a 
// method. 

// Strict mode, however, throws an error when you do this. Calling the Function constructor with eval-able code gets 
// around this because that code is then automatically somewhat outside "use strict".

// yes this is obscure and hackish, hence the long explanation and the jshint pragma.
return new Function("return this")();
}());
var $tools$47rsvp = (function (global) {

/**
 * Vow
 *
 * Copyright (c) 2012-2013 Filatov Dmitry (dfilatov@yandex-team.ru)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * @version 0.3.9
 */
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

function afterAll(arrayOfPromises) {
    var promise = rsvp.promise();
    var toHandle = arrayOfPromises.length;

    if (toHandle === 0) {
        promise.fulfill([]);
    } else {
        var result = [];
        map(arrayOfPromises, function (promiseOrValue, index) {
            function handleItem(promiseOrValue) {
                result[index] = promiseOrValue;
                toHandle--;
                if (toHandle === 0) {
                    promise.fulfill(result);
                }
            }

            if (typeof promiseOrValue === 'object' && typeof promiseOrValue.then === 'function') {
                promiseOrValue.then(
                    function (val) { handleItem(promiseOrValue); },
                    function (val) { handleItem(promiseOrValue); }
                );
            } else {
                var wrapper = rsvp.promise();
                wrapper.resolve(promiseOrValue);
                handleItem(wrapper);
            }
        });
    }
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
var $richard$47results$47NestedResults = (function (map,reduce) {
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
    if (result.failedCount > 0) {
        result.messages.unshift(this._groupCaption + " [" + result.passedCount + "/" + (result.passedCount + result.failedCount) + "]");
    } else if (result.failedCount === 0 && result.passedCount === 0) {
        result.messages.unshift("NO TESTS! " + this._groupCaption);
    } else {
        result.messages.unshift(this._groupCaption);
    }
    return result;
};

return NestedResults;
}($tools$47map,$tools$47reduce));
var $richard$47results$47Result = (function () {
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
var $tools$47objLoop = (function () {

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
}());
var $richard$47expect$47equals = (function (objLoop,test) {

var equals;
function objectsAreEqual(actual, expected, actualMayHaveMoreProperties, prefix, details) {
    var key;
    if (actual === expected) {
        return;
    }
    objLoop(expected, function (key, value) {
        equals(actual[key], value, actualMayHaveMoreProperties, prefix + "." + key, details);
    });
    if (!actualMayHaveMoreProperties) {
        objLoop(actual, function (key, value) {
            if (!expected.hasOwnProperty(key)) { //if it wasn't defined, we have checked it at the loop above
                details[prefix + "." + key] = [value, undefined];
            }
        });
    }
}

equals = function (actual, expected, actualMayHaveMoreProperties, prefix, details) {
    var isEqual = true,
        message;
    if (actual !== expected) {
        if (expected && expected.jasmineMatches) {
            isEqual = expected.jasmineMatches(actual);
        } else if (actual instanceof Date && expected instanceof Date) {
            isEqual = actual.getTime() === expected.getTime();
        } else if ((actual instanceof String || typeof actual === "string") && (expected instanceof String || typeof expected === "string")) {
            //make sure equals("foo", new String("foo")) => true
            isEqual = (actual.valueOf() === expected.valueOf());
        } else if ((actual instanceof Number || typeof actual === "number") && (expected instanceof Number || typeof expected === "number")) {
            isEqual = (actual.valueOf() === expected.valueOf());
        } else if ((actual instanceof Boolean || typeof actual === "boolean") && (expected instanceof Boolean || typeof expected === "boolean")) {
            isEqual = (actual.valueOf() === expected.valueOf());
        } else if (typeof actual === "object" && typeof expected === "object") {
            objectsAreEqual(actual, expected, actualMayHaveMoreProperties, prefix, details);
        } else {
            isEqual = false;
        }
    }
    if (!isEqual) {
        details[prefix] = [actual, expected];
    }
};

return function (actual, expected, actualMayHaveMoreProperties) {
    var details = {};
    equals(actual, expected, actualMayHaveMoreProperties, "", details);
    return {
        passed: Object.keys(details).length === 0, 
        details: details
    };
};
}($tools$47objLoop,$richard$47non$45recursetest));
var $richard$47expect$47contains = (function (equals) {

/* jshint -W018 */ //!! converts something to an actual boolean value
return function contains(haystack, needle) {
    var i;
    if (typeof haystack.indexOf === "function") {
        return !!(haystack.indexOf(needle) > -1); //!! converts to an actual boolean value
    }
    for (i = 0; i < haystack.length; i += 1) {
        if (equals(haystack[i], needle).passed) {
            return true;
        }
    }
    return false;
};
}($richard$47expect$47equals));
var $richard$47expect$47prettyPrint = (function (contains,global,test) {

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
}($richard$47expect$47contains,$tools$47global,$richard$47non$45recursetest));
var $richard$47expect$47expectFactory = (function (prettyPrint,Result,equals,contains,objLoop) {
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
                message = "Expected: " + prettyPrint(expectation.actual) + (expectation.isNot ? " not " : " ") + englishyPredicate + " ";
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
        var equal = equals(this.actual, expected);
        this.message = function(req) {
            var result = "differences found:\n";
            objLoop(equal.details, function(key, value) {
                result += "  '" + key + "' is " + prettyPrint(value[0]) + " instead of " + prettyPrint(value[1]) + ".\n";
            });
            return result;
        };
        return equal.passed;
    },
    toBeDefined: function() {
        return this.actual !== undefined;
    },
    toHave: function(expected) {
        return typeof this.actual.hasOwnProperty === "function" && this.actual.hasOwnProperty(expected);
    },
    toMatch: function(expected) {
        return (typeof this.actual === "string" || this.actual instanceof String) && (new RegExp(expected)).test(this.actual);
    },
    toHappen: function() {
        return true;
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
}($richard$47expect$47prettyPrint,$richard$47results$47Result,$richard$47expect$47equals,$richard$47expect$47contains,$tools$47objLoop));
var $richard$47specs$47It = (function (rsvp,expectFactory,Result,NestedResults) {
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
}($tools$47rsvp,$richard$47expect$47expectFactory,$richard$47results$47Result,$richard$47results$47NestedResults));
var $richard$47specs$47Spec = (function (afterAll,NestedResults,Result,It,map) {
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
    var promiseQueue;
    var specResults = new NestedResults(self.description);
    function execute(it) {
        return it.execute().then(function(result) {
            specResults.addResult(result);
        }, function(err) {
            specResults.addResult(new Result(err.stack, false));
        });
    }
    map(this._queue, function(it, index) {
        if (promiseQueue) {
            promiseQueue = promiseQueue.then(function() {
                return execute(it);
            }, function() {
                return execute(it);
            });
        } else {
            promiseQueue = execute(it);
        }
    });
    return promiseQueue.then(function() {
        return specResults;
    });
};

return Spec;
}($tools$47afterAll,$richard$47results$47NestedResults,$richard$47results$47Result,$richard$47specs$47It,$tools$47map));
var $richard$47test = (function (Spec) {

/*
FIXME: should callback even if there is an empty spec()
*/
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
}($richard$47specs$47Spec));
var $richard$47createSpy = (function (equals,map,prettyPrint,objLoop) {
function createSpy() {
    function spy() {
        var i, argumentMap = {}, result;
        if (typeof spy.result === "function") {
            result = spy.result.apply(this, arguments);
        } else {
            result = spy.result;
        }
        if (spy.argumentNames) {
            for (i = 0; i < arguments.length; i += 1) {
                argumentMap[spy.argumentNames[i]] = arguments[i];
            }
        }
        spy.calls.push({
            arg: argumentMap,
            args: arguments,
            obj: this,
            result: result
        });
        return result;
    }
    if (typeof arguments[0] === "function") {
        spy.description = arguments[0].name;
        spy.result = arguments[0];
    } else {
        spy.description = arguments[0];
        spy.result = arguments[1];
    }
    spy.calls = [];
    if (typeof spy.result === "function") {
        spy.argumentNames = spy.result.toString().split(")")[0].split("(")[1].split(/\s*,\s*/);
    }
    spy.expectMatchers = {
        toHaveBeenCalled: function() {
            return this.actual.calls.length > 0;
        },
        toHaveBeenCalledWith: function() {
            var mostRecentCall = this.actual.calls.length - 1, equality;
            if (mostRecentCall < 0) {
                this.message = function(seq) {
                    return "expected " + prettyPrint(this.actual) + (this.isNot ? " not " : " ") + "to have been called with:\n" + map(arguments, prettyPrint).join(", ") + "\n" + " but it was not called.\n";
                };
                return false;
            }
            equality = equals(this.actual.calls[mostRecentCall].args, arguments);
            if (equality.passed) {
                return true;
            } else {
                this.message = function(seq) {
                    var result;
                    if (this.isNot) {
                        return "No differences between the expected and actual calls: ";
                    } else {
                        result = "Differences between the expected and actual calls: ";
                        objLoop(equality.details, function(key, value) {
                            result += "  '" + key + "' is " + prettyPrint(value[0]) + " instead of " + prettyPrint(value[1]) + ".\n";
                        });
                        return result;
                    }
                };
                return false;
            }
        },
        toHaveBeenCalledWithTheSequence: function() {
            var result = true;
            var actual = this.actual;
            if (actual.calls.length !== arguments.length) {
                result = false;
            }
            map(arguments, function checkCall(args, index) {
                if (actual.calls.length > index) {
                    result = result && equals(actual.calls[index].args, args).passed;
                } else {
                    result = false;
                }
            });
            if (!result) {
                this.message = function(seq) {
                    return "expected " + prettyPrint(this.actual) + (this.isNot ? " not " : " ") + "to have been called with the sequence:\n" + prettyPrint(Array.prototype.slice.call(arguments)) + "\n" + " but it was called with\n" + prettyPrint(map(this.actual.calls, function(call) {
                        return Array.prototype.slice.call(call.args);
                    }));
                };
            }
            return result;
        }
    };
    spy.toString = function() {
        return "<Spy for " + this.description + ">";
    };
    return spy;
}

return createSpy;
}($richard$47expect$47equals,$tools$47map,$richard$47expect$47prettyPrint,$tools$47objLoop));
var $igor$47tools$47writeLog = (function (console,map,test,createSpy) {

function writeLog(indentLevel, textOrArray) {
    var indent = (new Array(indentLevel+1)).join("  ");
    if (typeof textOrArray === "string") {
        textOrArray = textOrArray.split("\n");
    }
    map(textOrArray, function (text) {
        console.log(indent + text);
    });
}

writeLog.withIndent = function(baseLevel) {
    return function (indentLevel, text) {
        return writeLog(baseLevel + indentLevel, text);
    };
};

return writeLog;
}($tools$47node$45wrappers$47console,$tools$47map,$richard$47test,$richard$47createSpy));
var $larry$47getDirContents = (function (map) {

var fs = require('fs');
var path = require('path');
function getDirContents(dirPath, callback, doneCallback) {
    fs.readdir(dirPath, function (err, dirEntries) {
        function anotherOneDone() {
            filesToHandle -= 1;
            if (filesToHandle === 0) {
                doneCallback();
            }
        }
        if (err != null) {
            console.log(err);
        } else {
            var i, filesToHandle;
            filesToHandle = dirEntries.length;
            map(dirEntries, function(entry) {
                var filePath = path.join(dirPath, entry);
                fs.stat(filePath, function (err, stats) {
                    if (stats && stats.isDirectory()) {
                        callback(null, filePath);
                        getDirContents(filePath, callback, anotherOneDone);
                    } else {
                        callback(filePath, null);
                        anotherOneDone();
                    }
                });
            });
        }
    });
}

return getDirContents;
}($tools$47map));
var $larry$47moduleLoaders$47JesterDashSeperated$47yamlparser = (function () {

return require('js-yaml').safeLoad;
}());
var $larry$47moduleLoaders$47tools$47resolveRelativeAMDid = (function () {

// "()" baseId, relativeId:
//     baseId <- "<is string>"
//     relativeId <- "<is string>"
//     string as returnvalue
return function resolveRelativeAMDid(baseId, relativeId) {
    var url = require('url'),
        result;
    if (relativeId[0] === ".") {
        result = url.resolve(baseId, relativeId);
    } else {
        result = relativeId;
    }
    return result;
}
}());
var $larry$47moduleLoaders$47tools$47getAmdIdFromPath = (function () {

// "()" dirPath, filepath:
//     dirPath <- "<is string>"
//             <- "<absolute path>"
//             <- "<ends with pathsep>"

//     filepath <- "<is string>"
//              <- "<absolute path>"

//     string as returnvalue
function getAmdIdFromPath(dirPath, filepath) {
    var pathlib = require('path');
    //strip base directory, dirPath always ends in / so the new filepath never starts with /
    filepath = filepath.substr(dirPath.length);

    //strip extension
    filepath = filepath.substr(0, filepath.length - pathlib.extname(filepath).length);

    //convert \ or : to / if needed
    filepath = filepath.split(pathlib.sep).join("/");

    return filepath;
}
return getAmdIdFromPath;
}());
var $larry$47moduleLoaders$47EmptyModule = (function (getAmdIdFromPath) {

function ModuleBase() {

}
ModuleBase.prototype.init = function (baseDir, filePath, namespace) {
    this.AMDid = namespace + "/" + getAmdIdFromPath(baseDir, filePath);
    this.dependencies = [];
    this.dependencyVariables = [];
    this.expectations = {};
    this.contractText = "";
    this.defineFunctionBody = "";
    this.testFunctionBody = "";
}

function EmptyModule(baseDir, filePath, namespace) {
    this.init(baseDir, filePath, namespace);
}

EmptyModule.prototype = new ModuleBase();

return EmptyModule;
}($larry$47moduleLoaders$47tools$47getAmdIdFromPath));
var $larry$47moduleLoaders$47NotMyTypeError = (function () {

function NotMyTypeError() {
}

NotMyTypeError.toString = function () {
    return "NotMyTypeError";
};

return NotMyTypeError;
}());
var $richard$47any = (function () {
function any(expectedClass) {
    var noExpectedClass = arguments.length === 0;
    return {
        jasmineMatches: function(other) {
            if (noExpectedClass) {
                return true;
            }
            if (expectedClass === String) {
                return typeof other === "string" || other instanceof String;
            }
            if (expectedClass === Number) {
                return typeof other === "number" || other instanceof Number;
            }
            if (expectedClass === Function) {
                return typeof other === "function" || other instanceof Function;
            }
            return other instanceof expectedClass;
        },
        toString: function() {
            return "<any " + expectedClass.name + ">";
        }
    };
}

return any;
}());
var $richard$47template = (function (equals) {

return function template(obj) {
    return {
        jasmineMatches: function (actual) {
            return equals(actual, obj, true).passed;
        },
        toString: function () {
            return "<template: " + JSON.stringify(obj) + ">";
        }
    };
};
// this.message = function (req) {
//     if (this.isNot) {
//         return "actual did have " + prettyPrint(expected);
//     }
//     var result = "differences found:\n";
//     objLoop(equal.details, function (key, value) {
//         result += "  '" + key + "' is " + prettyPrint(value[0]) + " instead of " + prettyPrint(value[1]) + ".\n";
//     })
//     return result;
// }

}($richard$47expect$47equals));
var $larry$47moduleLoaders$47JesterDashSeperated$47contractFileLoader = (function (objLoop,yamlparser,resolveRelativeAMDid,EmptyModule,NotMyTypeError,test,createSpy,any,template) {

function parseFile(code) {
    var result, blocks, header;

    blocks = code.split(/^---$/m);
    if (blocks.length < 5) { //<empty>, header, test, contract, module. Starts with empty because the file starts with ---
        throw new NotMyTypeError();
    }
    header = yamlparser(blocks[1]) || {};

    return {
        expects: header.expects,
        moduleText: blocks[4],
        dependencyIDs: header.dependencies,
        testText: blocks[2],
        contractText: blocks[3]
    };
}

function ContractModule(baseDir, filePath, namespace, jsCode) {
    var dep, file, self;
    if (filePath.substr(-3) !== ".js") {
        throw new NotMyTypeError();
    }    
    self = this;
    self.init(baseDir, filePath, namespace);
    file = parseFile(jsCode);

    if (file.dependencyIDs) {
        for (dep in file.dependencyIDs) {
            if (file.dependencyIDs.hasOwnProperty(dep)) {
                self.dependencies.push(resolveRelativeAMDid(self.AMDid, file.dependencyIDs[dep]));
                self.dependencyVariables.push(dep);
            }
        }
    }
    if (file.expects) {
        self.expectations = objLoop(file.expects, function (key, value, newKey) {
            var optionalIdentifier = "optional ";
            var isOptional = key.substring(0, optionalIdentifier.length) === optionalIdentifier;
            if (isOptional) {
                newKey(key.substring(optionalIdentifier.length));
            }
            return {
                url: value,
                optional: isOptional,
                variable: key.substring(optionalIdentifier.length)
            };
        });
    }
    if (file.contractText) {
        self.contractText = file.contractText;
    }
    if (file.moduleText) {
        self.defineFunctionBody = file.moduleText;
    }
    if (file.testText) {
        self.testFunctionBody = file.testText;
    }
}

ContractModule.prototype = EmptyModule.prototype;

function loadModule(baseDir, filePath, namespace, contents, callback) {
    var loadedModule, error;
    try {
        loadedModule = new ContractModule(baseDir, filePath, namespace, contents);
    } catch (e) {
        error = e;
    }
    callback(error, loadedModule);
}

return loadModule;


// "()" baseDir, filePath, callback:
//     filePath <- "<string>"
//     string as jsCode

//     parseFile <- "()" jsCode, exceptionHandler as parsed

//     parsed <- ".AMDid" as amdId
//     getAmdIdFromPath <- "()" baseDir, filePath as amdId

//     variableName <- "()" amdId <- "<valid variable>"

//     parsed <- ".dependencies" as deps
//     parsed <- ".testDependencies" as testdeps
//     deps <- "for(i)" as depToResolve
//     testdeps <- "for(i)" as depToResolve
//     resolveRelativeAMDid <- "()" amdId, depToResolve

//     parsed <- ".defineFunction" as moduleCode <- "<valid js>"
//     parsed <- ".testFunction"  as testCode <- "<valid js>"

//     callback <- "()" error, AMDModule

//     AMDModule:
//         ".AMDid":
//             amdId as returnvalue
//         ".dependencies":
//             deps as returnvalue
//         ".testDependencies":
//             testdeps as returnvalue
//         ".defineFunctionBody":
//             moduleCode as returnvalue
//         ".testFunctionBody":
//             testCode as returnvalue
//         ".callExecuteCode()":
//             validJsCt:
//                 string+
//                 "<valid js>"
//             validJsCt as returnvalue
//         ".addNamespace()" namespace:
//             namespace <- "<is string>"
}($tools$47objLoop,$larry$47moduleLoaders$47JesterDashSeperated$47yamlparser,$larry$47moduleLoaders$47tools$47resolveRelativeAMDid,$larry$47moduleLoaders$47EmptyModule,$larry$47moduleLoaders$47NotMyTypeError,$richard$47test,$richard$47createSpy,$richard$47any,$richard$47template));
var $larry$47moduleLoaders$47AMD$47AMDFileLoader = (function (getAmdIdFromPath,resolveRelativeAMDid,EmptyModule) {

var uglify = require("uglify-js"),
    NOT_AN_AMD_MODULE = "no define() method found";
function unwrapValue(ast) {
    //in the ast a string is ["string", "value"] and an array is ["array", []] etc.
    return ast[1];
}
function grabDefineCallArgumentsAst(ast) {
    var i,
        statement,
        error;
    //We're looking for the dependency array in the code:
    //    define([ "depA", "depB" ], function(a, b) {
    //this translates to the AST: (we're looking for the part marked with a #)
    //    ['toplevel', [ ['stat', ['call', ['name', 'define'], #[ /*arguments...*/ ]]] ] ]
    if (ast[0] !== 'toplevel') {
        debugger ;
    }
    ast = ast[1];
    for (i = 0; i < ast.length; i += 1) {
        statement = ast[i];
        if (statement[0] === 'stat') { //I'm not completely sure when a statment is wrapped in a stat
            statement = statement[1];
        }
        if (statement[0] === 'call' && statement[1][1] === 'define') {
            return statement[2];
        }
    }
}

function unwrapDependencyArray(dependencyParameterAst) {
    return unwrapValue(dependencyParameterAst).map(unwrapValue);
}

function tryExtractAmdId(argumentAst) {
    var result;
    if (argumentAst.length > 0 && argumentAst[0][0] === 'string') {
        result = unwrapValue(argumentAst[0]);
        argumentAst.shift();
    }
    return result;
}
function tryExtractArray(argumentAst) {
    var result = [];
    if (argumentAst.length > 0 && argumentAst[0][0] === 'array') {
        result = unwrapDependencyArray(argumentAst[0]);
        argumentAst.shift();
    }
    return result;
}
function tryExtractFunction(argumentAst) {
    var result;
    if (argumentAst.length > 0) {
        return argumentAst.shift();
    }
    return result;
}

function extractFunctionBody(functionAst) {
    return uglify.uglify.gen_code(['toplevel', functionAst[3]], {beautify:true});
}

function extractFunctionArguments(functionAst) {
    return functionAst[2];
}

function parseDefineCall(code) {
    var result = {},
        ast = uglify.parser.parse(code),
        argumentAst = grabDefineCallArgumentsAst(ast),
        defineFunction,
        testFunction;
    if (!argumentAst) {
        throw new Error(NOT_AN_AMD_MODULE);
    }
    result.AMDid = tryExtractAmdId(argumentAst);
    result.dependencies = tryExtractArray(argumentAst);
    result.dependencyVariables = [];
    defineFunction = tryExtractFunction(argumentAst);
    if (defineFunction) {
        result.defineFunctionBody = extractFunctionBody(defineFunction);
        result.dependencyVariables = extractFunctionArguments(defineFunction);
    }
    return result;
}


function AMDModule(baseDir, filePath, namespace, jsCode) {
    var defineCallArguments, self;
    if (filePath.substr(-3) !== ".js") {
        throw new Error(NOT_AN_AMD_MODULE);
    }
    self = this;
    self.init(baseDir, filePath, namespace);

    defineCallArguments = parseDefineCall(jsCode);
    if (defineCallArguments.AMDid) {
        self.AMDid = namespace + "/" + defineCallArguments.AMDid;
    }

    self.dependencies = defineCallArguments.dependencies.map(function (dep) { return resolveRelativeAMDid(self.AMDid, dep); });
    self.dependencyVariables = defineCallArguments.dependencyVariables;
    if (defineCallArguments.defineFunctionBody) {
        self.defineFunctionBody = defineCallArguments.defineFunctionBody;
    }
    if (defineCallArguments.testFunctionBody) {
        self.testFunctionBody = defineCallArguments.testFunctionBody;
    }
}

AMDModule.prototype = EmptyModule.prototype;

AMDModule.prototype.addNamespace = function (key) {
    if (key !== "") {
        this.AMDid = key + "/" + this.AMDid;
        this.dependencies = this.dependencies.map(function (id) { return key + "/" + id; });
        this.testDependencies = this.testDependencies.map(function (id) { return key + "/" + id; });
    }
};

function loadModule(baseDir, filePath, namespace, contents, callback) {
    var loadedModule, error;
    try {
        loadedModule = new AMDModule(baseDir, filePath, namespace, contents);
    } catch (e) {
        error = e;
    }
    //not inside the try block so an error in the callback won't trigger the catch
    callback(error, loadedModule);
}

return loadModule;
}($larry$47moduleLoaders$47tools$47getAmdIdFromPath,$larry$47moduleLoaders$47tools$47resolveRelativeAMDid,$larry$47moduleLoaders$47EmptyModule));
var $tools$47node$45wrappers$47fs = (function () {

return require("fs");
}());
var $larry$47moduleLoaders$47delegatingLoader = (function (contractFileLoader,AMDFileLoader,fs,NotMyType) {

var handlers = [
    contractFileLoader,
    AMDFileLoader
];

function handleOrDelegate(handlerId, baseDir, filePath, namespace, contents, callback) {
    if (handlers[handlerId]) {
        handlers[handlerId](baseDir, filePath, namespace, contents, function (error, module) {
            if (error instanceof NotMyType) {
                handleOrDelegate(handlerId + 1, baseDir, filePath, namespace, contents, callback);
            } else {
                callback(error, module);
            }
        });
    } else {
        callback(undefined, undefined);
    }
}

function loadModule(baseDir, filePath, namespace, callback) {
    try {
        fs.readFile(filePath, 'utf-8', function (errors, contents) {
            if (errors) {
                //something went wrong while reading the file. This usually means that the file is not really available
                //so we're signaling as if its not a real js file.
                callback(errors, undefined);
            } else {
                handleOrDelegate(0, baseDir, filePath, namespace, contents, callback);
            }
        });
    } catch (e) {
        //something went wrong with loading the module. So it still might be a js module.
        callback(e, undefined);
    }
}

return loadModule;
}($larry$47moduleLoaders$47JesterDashSeperated$47contractFileLoader,$larry$47moduleLoaders$47AMD$47AMDFileLoader,$tools$47node$45wrappers$47fs,$larry$47moduleLoaders$47NotMyTypeError));
var $larry$47dirWatcher = (function (fs,path,test,createSpy) {

// "()" dir, callback:
//     dir <- "<absolute path>"
//     callback <- "()" path, boolean
//     closer as returnvalue

//     path:
//         string+
//         "<absolute path>":

//     closer:
//         "()":
function dirWatcher(dir, callback) {
    var mtimes, watcher;

    mtimes = {};
    watcher = fs.watch(dir, function (event, pathOfFile) {
        if (pathOfFile) {//sometimes a rename event is fired with pathOfFile == null I don't know why, so I ignore it.
            pathOfFile = path.join(dir, pathOfFile);
            if (event === "change"){
                //FIXME: stats can be empty when an err
                fs.stat(pathOfFile, function (err, stats) {
                    //side effect is that clearing a file will not trigger an update. I don't mind because an empty
                    //file is not a valid js file anyway, so it will never have any effect on the resulting artifact
                    if ((mtimes[pathOfFile] === undefined || mtimes[pathOfFile] < stats.mtime) && stats.size > 0 ) {
                        mtimes[pathOfFile] = stats.mtime;
                        callback(pathOfFile, true);
                    }
                });
            } else if (event === "rename"){ 
                fs.stat(pathOfFile, function(err, res){
                    if (err){
                        callback(pathOfFile, false);
                    } else {
                        callback(pathOfFile, true);
                    }
                });
            }
        }
    });

    return function () {
        watcher.close();
    };
}

return dirWatcher;
}($tools$47node$45wrappers$47fs,$tools$47node$45wrappers$47path,$richard$47test,$richard$47createSpy));
var $larry$47main = (function (getDirContents,loadModule,dirWatcher,map,objLoop,test,createSpy,template) {

// contract:
//     "()" includeDirs, addedOrChangedCallback, deletedCallback:


// "()" includeDirs, addedOrChangedCallback, deletedCallback:

//     includeDirs <- "for(in)" as dirs
//     dirWatcher <- "()" dirs, dirWatcherCallback as closers
//     getDirContents <- "()" dirs getDirContentsCallback
//     closer as returnvalue

//     {} as cache

//     dirWatcherCallback:
//         "()" path, exists:
//             fileUpdate <- "()" path, exists

//     getDirContentsCallback:
//         "()" path:
//             fileUpdate <- "()" path, boolean

//     fileUpdate:
//         "()" path, exists:
//             path <- ".substr()" integer
//             tryReload:
//                 "()" key, sourcedir, path:
//                     exceptionHandler:
//                         "Error: invalid javascript":
//                         "Error: no define call":

//                     contractModule <- "new()" sourcedir, paths, exceptionHandler as returnvalue <- ".addNamespace()" key
//             tryReload <- "()" namespace, dirs, path as module 
//             cache <- "[]" path, module
//                   <- "delete" path
//                   <- ".hasOwnProperty()" path
//             hashMap as snapshot

//             callback:
//                 "()" path, module:
//                     module <- ".AMDid" as id
//                     snapshot <- "[]" id, module
//             objLoop <- "()" cache callback

//             addedOrChangedCallback <- "()" module snapshot
//             deletedCallback <- "()" snapshot

//     closer:
//         "()":
//             map <- "()" closers mapCallback

//             mapCallback closer:
//                 closer <- "()"
function createSnapshot(cache) {
    var snapshot = {};

    objLoop(cache, function (path, module) {
        if (snapshot.hasOwnProperty(module.AMDid)) {
            throw new Error(path + " has an AMDid (" + module.AMDid + ") that is already defined by " + snapshot[module.AMDid].path);
        }
        snapshot[module.AMDid] = {
            path: path,
            AMDid: module.AMDid,
            dependencies: module.dependencies,
            dependencyVariables: module.dependencyVariables,
            contractText: module.contractText,
            defineFunctionBody: module.defineFunctionBody,
            testFunctionBody: module.testFunctionBody,
            expectations: module.expectations,
            dependants: []
        };
    });
    objLoop(snapshot, function (id, module) {
        map(module.dependencies, function (dep) {
            if (!snapshot.hasOwnProperty(dep)) {
                var hint = "";
                if (dep.substr(-3) === ".js") {
                    hint = "(It ends with .js, dependencies usually don't)";
                }
                console.log("dependency " + dep + " of " + module.path + " was not found. " + hint);
            } else {
                snapshot[dep].dependants.push(id);
            }
        });
    });
    return snapshot;
}

function fileUpdate(cache, path, exists, namespace, sourcedir, addedOrChangedCallback, deletedCallback) {
    var snapshot;
    function doDelete() {
        if (cache.hasOwnProperty(path)) {
            delete cache[path];
            deletedCallback(createSnapshot(cache));
        }
    }
    function doUpdate(module) {
        cache[path] = module;
        addedOrChangedCallback(undefined, cache[path].AMDid, createSnapshot(cache));
    }
    if (exists) {
        loadModule(sourcedir, path, namespace, function (errors, module) {
            if (errors) {
                addedOrChangedCallback(errors);
            } else {
                if (module) {
                    doUpdate(module);
                } else {
                    //The module is identified by all loaders as "not a js module"
                    doDelete();
                }
            }
        });
    } else {
        doDelete();
    }
}

function fileLoad(cache, path, namespace, sourcedir, dir, watchDir) {
    if (path) {
        //addedOrChangedCallback isn't triggered on initial load because the snapshot cannot be relied on yet
        loadModule(sourcedir, path, namespace, function (errors, module) {
            if (module) {
                //at least one loader attempted to load it
                cache[path] = module;
            }
        });
    } else {
        watchDir(dir);
    }

}

function watchDir(namespace, sourcedir, cache, addedOrChangedCallback, deletedCallback) {
    var closers = [];
    function innerWatchDir(dir) {
        closers.push(dirWatcher(dir, function (path, exists) {
            fileUpdate(cache, path, exists, namespace, sourcedir, addedOrChangedCallback, deletedCallback);
        }));
    }
    innerWatchDir(sourcedir);

    getDirContents(
        sourcedir, 
        function (path, dir) {
            fileLoad(cache, path, namespace, sourcedir, dir, innerWatchDir);
        },
        function () {}
    );

    return function () {
        map(closers, function (closer) { closer(); });
    };
}

function getModules(includeDirs, addedOrChangedCallback, deletedCallback) {
    var closers = [],
        cache = {};
    
    objLoop(includeDirs, function (namespace, dir) {
        closers.push(watchDir(namespace, dir, cache, addedOrChangedCallback, deletedCallback));
    });

    return function () {
        map(closers, function (closer) { closer(); });
    };
}
return getModules;
}($larry$47getDirContents,$larry$47moduleLoaders$47delegatingLoader,$larry$47dirWatcher,$tools$47map,$tools$47objLoop,$richard$47test,$richard$47createSpy,$richard$47template));
var $tess$47main = (function (afterAll,map,reduce,test) {

function TestSystem() {
    this._runners = [];
}

TestSystem.prototype.addRunner = function (runner) {
    this._runners.push(runner);
};

TestSystem.prototype.runTest = function (code, expectations, useDebugger, callback) {
    var i = 0;
    var validRunners = this._runners.filter(function (runner) { return runner.findMissingMatches(expectations).length === 0; });
    if (validRunners.length === 0 ) {
        callback({ passed: true, details: ["No valid runner found"], runners: [] });
    } else {
        var validRunnerNames = validRunners.map(function (r) { return r.toString(); });
        var runs = map(validRunners, function (runner) { return runner.run(code, useDebugger); });

        afterAll(runs).then(
            function (results) {
                callback(reduce(
                    results, 
                    function (result, runnerResult, i) {
                        runnerResult = runnerResult.valueOf();
                        result.runner = validRunnerNames[i];
                        result.passed = result.passed && runnerResult.passed;
                        result.details = result.details.concat(runnerResult.details);
                        return result;
                    },
                    { passed: true, details: [], runners: validRunnerNames }
                ));
            },
            function (err) {
                callback({ passed: false, details: [err.stack], runners: validRunnerNames });
            }
        ).fail(function (e) {
            callback({ passed: false, details: [e.stack], runners: validRunnerNames });
        });
    }
};
return TestSystem;
}($tools$47afterAll,$tools$47map,$tools$47reduce,$richard$47test));
var $tools$47node$45wrappers$47url = (function () {

return require('url');

}());
var $tools$47requestHandler = (function (objLoop,urlTools,test,createSpy) {

function RequestHandler(optContext, mappings) {
    var self = this;
    var requestedContextArgs;
    self.matchers = {};
    self.urlFor = {};
    if (mappings) {
        requestedContextArgs = optContext;
    } else {
        requestedContextArgs = [];
        mappings = optContext;
    }
    objLoop(mappings, function (urlSpec, callback) { self.addMatch(requestedContextArgs, urlSpec, callback); });
}

function patternMatches(pattern, incomingUrl) {
    var matchedVariablesForThisHandler = [];
    pattern += "/"; //the matcher will match an url without trailing slash if the pattern has a trailing slash
    //and patterns never end in a slash
    var patternSegments = pattern.split("/");
    var thisPatternMatches = true;
    var i;
    var urlSegment;
    var incomingUrlSegments = incomingUrl.split("/");
    for (i = 0; i < incomingUrlSegments.length; i += 1) {
        urlSegment = incomingUrlSegments[i];
        if (patternSegments[i] === "{*}") {
            matchedVariablesForThisHandler.push(urlSegment);
        } else if (patternSegments[i] === "...") {
            break;
        } else if (patternSegments[i] !== urlSegment) {
            thisPatternMatches = false;
        }
    }
    if (patternSegments[i]) {
        if (patternSegments[i] !== "...") {
            thisPatternMatches = false;
        } else {
            matchedVariablesForThisHandler.push({
                first: incomingUrlSegments.slice(0, i).join("/"),
                rest: incomingUrlSegments[i] ? "/" + incomingUrlSegments.slice(i).join("/") : "/"
            });
        }
    }
    return {
        variables: thisPatternMatches ? matchedVariablesForThisHandler : [],
        patternMatches: thisPatternMatches
    };
}

RequestHandler.prototype.handle = function (request, response, contextObject, glob) {
    var matchers = this.matchers;
    var urlToHandle = request.url;
    var prefix = "";

    if (glob) {
        prefix = glob.first;
        urlToHandle = glob.rest;
    }
    if (!contextObject) {
        contextObject = {};
    }
    var incomingUrl = urlTools.parse(urlToHandle, true);
    var matchedHandler;
    var matchedVariables = [];
    objLoop(matchers[request.method], function (matchPattern, handlerFunction) {
        var matchResult = patternMatches(matchPattern, incomingUrl.pathname);
        if (matchResult.patternMatches) {
            matchedHandler = handlerFunction;
            matchedVariables = matchResult.variables;
        }
    });
    if (matchedHandler) {
        var contextArgs = matchedHandler.requestedContextArgs.map(function (a) { return contextObject[a]; });
        return matchedHandler.handler.apply(
            {
                urlFor: objLoop(this.urlFor, function (key, value) {
                    return function () {
                        return prefix + value.apply(this, arguments);
                    };
                }),
                request: request,
                response: response
            },
            matchedVariables.concat([incomingUrl.query]).concat(contextArgs)
        );
    }
};

function specIsAllowed(urlSpec, currentSpecs) {
    var errors = [];
    //check that there is no /foo-{*}/bar but only /{*}/bar
    if (urlSpec.match("([^/]{.}[^/]|[^/]{.}$)")) {
        errors.push("'{*}' matches the whole part between the slashes, you can't specify a subpart");
    }
    //check that ... is only at the end
    if (urlSpec.match("\\.\\.\\..")) {
        errors.push("'...' can only be placed at the end of the url, because it matches the whole remaining portion");
    }
    if (urlSpec.match("(^\\./|/\\./|/\\.$|^\\.\\./|/\\.\\./|/\\.\\.$)")) {
        errors.push("relative path specifications (./ or ../) will not work.");
    }
    if (urlSpec.match("./$")) {
        errors.push("Path specs may not end in a slash (to ensure consistency). the spec /foo will also match /foo/");
    }
    if (!urlSpec.match("^/")) {
        errors.push("Path specs must start with a slash (to ensure consistency)");
    }
    //check for ambiguous matches
    var specParts = urlSpec.split("/");
    // /foo/bar and /foo/{*} both match /foo/bar. that is not allowed because that means that depending on the order
    // of the matches a different result will appear. That makes the code more complex and I haven't found it 
    // necessary. You can always do complex matching by matching using ... and interpreting the remainder of the url
    // yourself.
    var matches = currentSpecs.filter(function (other) {
        other = other.split("/");
        if (other.length !== specParts.length) {
            return false;
        } else {
            var matchingElements = specParts.filter(function (part, index) {
                return part === "{*}" || other[index] === part;
            });
            return matchingElements.length === other.length;
        }
    });
    if (matches.length > 0) {
        errors.push("Ambiguous match with: '" + matches.join("', '") + "'.");
    }
    return errors;
}

function handlerIsAllowed(handler, existingHandlers) {
    var errors = [];
    if (existingHandlers.indexOf(handler.name) > -1) {
        errors.push("Duplicate handler name '" + handler.name + "' is not allowed because this means one of the handlers can't be reached in urlFor.");
    }
    return errors;
}

RequestHandler.prototype.addMatch = function (requestedContextArgs, urlSpec, handler) {
    var matchers = this.matchers;

    var method;
    var methodAndUrlSpec = urlSpec.match(/(.*) \(([A-Z]+)\)$/);
    if (methodAndUrlSpec) {
        urlSpec = methodAndUrlSpec[1];
        method = methodAndUrlSpec[2];
    } else {
        method = "GET";
    }
    if (!matchers[method]) {
        matchers[method] = {};
    }
    var errors = specIsAllowed(urlSpec, Object.keys(matchers[method]));
    errors = errors.concat(handlerIsAllowed(handler, Object.keys(this.urlFor)));
    if (errors.length > 0) {
        //this is bad enough to make the program crash because it should only happen during startup and the 
        //programmer _must_ to be aware of this.
        throw new Error(errors.join("; "));
    }
    matchers[method][urlSpec] = {
        requestedContextArgs: requestedContextArgs,
        handler: handler
    }

    this.urlFor[handler.name] = function () {
        var argPos = -1;
        var args = arguments;
        return urlSpec.
            split("/").
            map(function (part) {
                if (part === "{*}") {
                    argPos += 1;
                    if (args.length <= argPos) {
                        throw new Error("This url requires more arguments");
                    }
                    return args[argPos];
                } else if (part === "...") {
                    argPos += 1;
                    if (args[argPos].substr(0,1) !== "/") {
                        throw new Error("The path to fill in the /... part must start with a '/'.");
                    }
                    return args[argPos].substr(1);
                } else {
                    return part;
                }
            }).
            join("/");
    };
};

return RequestHandler;
}($tools$47objLoop,$tools$47node$45wrappers$47url,$richard$47test,$richard$47createSpy));
var $tools$47node$45wrappers$47http = (function () {

return require("http");
}());
var $tools$47server = (function (RequestHandler,http,test) {

function Webserver() {
    var requestHandler = new RequestHandler();
    this._requestHandler = requestHandler;
    this._httpServer = http.createServer(function (request, response) {
        //a request has content if it's content-length or it's encoding is set (if you want to send data without 
        //specifying a length then "transfer-encoding" must have the value "chunked")
        if (request.headers["content-length"] || request.headers["transfer-encoding"]) {
            var requestData = "";
            request.setEncoding("utf8");//the results are encoded as utf8 as well so formdata is posted as utf8
            request.on('data', function (block) {
                requestData += block;
            });
            request.on('end', function () {
                requestHandler.handle(
                    request,
                    response,
                    {
                        requestData: requestData, 
                        sendResults: function (result) {
                            response.end(result, "utf8");
                        }
                    }
                );
            });
        } else {
            requestHandler.handle(
                request, 
                response,
                {
                    sendResults: function (result) {
                        response.end(result, "utf8");
                    }
                }
            );
        }
    });
}

Webserver.prototype.start = function(port, hostname) {
    var self = this;
    self._httpServer.listen(port, hostname);
    self.port = port;
    self.hostname = hostname || "localhost";
};

Webserver.prototype.stop = function(port, hostname) {
    var self = this;
    self._httpServer.close();
    delete self.port;
    delete self.hostname;
};

Webserver.prototype.addMatch = function(requestedContext, matcher, handler) {
    this._requestHandler.addMatch(requestedContext, matcher, handler);
};

//handle changing tokens for posts (CSRF)
//don't send plain json in GET
return Webserver;
}($tools$47requestHandler,$tools$47node$45wrappers$47http,$richard$47test));
var $tools$47mkdirP = (function () {

var path = require('path');
var fs = require('fs');

function mkdirP(dirPath, callback) {
    fs.mkdir(dirPath, function (mkdirError) {
        if (mkdirError == null) {
            callback(undefined, dirPath);
        } else {
            if (mkdirError.code === 'ENOENT') {
                mkdirP(path.dirname(dirPath), function (unsolvableError) {
                    if (unsolvableError) {
                        callback(unsolvableError, dirPath);
                    }
                    else {
                        fs.mkdir(dirPath, function (err) {
                            //ignore it if the dir already exists
                            if (err && err.code === "EEXIST") {
                                callback(undefined, dirPath);
                            } else {
                                callback(err, dirPath);
                            }
                        });
                    }
                });
            } else if (mkdirError.code === 'EEXIST') {
                callback(undefined, dirPath);
            } else {
                //unsolvable
                callback(mkdirError, dirPath);
            }
        }
    });
}

return mkdirP;
}());
var $selenium$47Basesession = (function (test,rsvp,console) {

var request = require("request");

function promiseQueue() {
    var self = this;
    self._promise = rsvp.promise();
    self._promise.fulfill();
}

promiseQueue.prototype.push = function (toCall) {
    var self = this;
    self._promise = self._promise.always(toCall);
    return self._promise;
};

function Basesession() {
    // You should provide:
    //  - _serverUrl (string _not_ ending in a slash)
    //  - _username (if required by the server)
    //  - _password (if required by the server)
    //  - _messageQueue (a promise that will resolve (usually the result of the first call to sendRequest))
    //  - _sessionId (should be available when the first .then of the _messageQueue fires)
    //  - requestStart implementation
    //  - requestStop implementation
    this._messageQueue = new promiseQueue();
}

Basesession.prototype.sendSessionCommand = function (verb, path, data) {
    var self = this;
    if (path.substr(0,1) !== "/") {
        throw new Error("path must start with a slash");
    }
    return self._messageQueue.push(function () { 
        var url = self._serverUrl + "/session/" + self._sessionId + path;
        self._sendRequest(verb, url, data); 
    });
};

Basesession.prototype.openUrl = function (url, useDebugger) {
    this.sendSessionCommand("POST", "/url", {url: url});
    //implement commands to open a debug console if needed
};

Basesession.prototype.dispose = function () {
    return this.endSession();
};

Basesession.prototype._sendRequest = function (verb, url, data) {
    var self = this;
    var result = rsvp.promise();
    var requestData = {
        url: url,
        method: verb, 
        headers: {
            "Accept": "application/json;charset=UTF-8",
            "Content-Type": "application/json;charset=UTF-8"
        },
        body: data === undefined ? undefined : JSON.stringify(data),
        encoding: "utf8",
        followAllRedirects: true
    };
    if (self._username && self._password) {
        requestData.auth = {
            user: self._username,
            pass: self._password,
            sendImmediately: false //so we only set the auth header if the server asks us to
        };
    }
    request(requestData, function (error, res, body) {
        if (error) {
            result.reject({
                statusCode: res.statusCode,
                body: body,
                headers: res.headers
            });
        }
        if (body) {
            body = body.split("\u0000").join(""); //remove null characters
            try {
                body = JSON.parse(body);
            } catch(e) {
                result.reject({
                    statusCode: 599,
                    body: e.stack,
                    headers: {}
                });
            }
        }
        result.fulfill({
            statusCode: res.statusCode,
            body: body,
            headers: res.headers
        });
    });
    return result;
};

Basesession.prototype.launchSession = function () {
    var self = this;
    self._messageQueue.push(function () {
        var promise = self._sendRequest("POST", self._serverUrl + "/session", { desiredCapabilities: self._capabilities })
            .then(function (response) {
                self._sessionId = response.body.sessionId; 
            });
        return promise;
    });
};

Basesession.prototype.endSession = function () {
    var self = this;

    return self.sendSessionCommand("DELETE", "/").always(function () {
        self._sessionId = undefined;
    });
};

return Basesession;
}($richard$47test,$tools$47rsvp,$tools$47node$45wrappers$47console));
var $selenium$47Sauce$47Saucesession = (function (Basesession,console,test) {

function Saucesession(serverUrl, username, password, type, keepAlive) {
    var self = this;
    self._serverUrl = serverUrl;
    self._capabilities = Saucesession.type[type];
    self._username = username;
    self._password = password;
    self._keepAlive = keepAlive;
}

Saucesession.prototype = new Basesession();

Saucesession.type = {
    "IE10" : {
        platform: 'Windows 8',
        browserName: 'internet explorer',
        version: '10'
    },
    //List the rest
    //iphone werkt niet heel lekker. Heeft soms zelf geen internet (wut?) de vm wil vaak niet starten.
    //Je kan dan beter met de hand een vm starten en daarmee verbinden.
    'iPhone 6': {
        platform: 'OS X 10.8',
        browserName: 'iphone',
        version: '6'
    }
};

Saucesession.prototype.requestStart = function () {
    var self = this;
    clearTimeout(self._endSessionTimer);
    if (self._sessionId === undefined) {
        self.launchSession();
    } else {
        self.sendSessionCommand("GET", "/").fail(function (error) {
            self.launchSession();
        });
    }
};

Saucesession.prototype.requestStop = function () {
    var self = this;
    self._endSessionTimer = setTimeout(function () {
        self.endSession();
    }, self._keepAlive); //shutting down a browser and relaunching it takes time
};

Saucesession.prototype.toString = function () {
    return "session<sauce, " + this._capabilities.browserName + ">";
};

return Saucesession;
}($selenium$47Basesession,$tools$47node$45wrappers$47console,$richard$47test));
var $selenium$47Local$47LocalSeleniumsession = (function (Basesession,console,test) {

function LocalSeleniumsession(serverUrl, type) {
    var self = this;
    self._serverUrl = serverUrl;
    self._capabilities = LocalSeleniumsession.type[type];
    self.launchSession();
}

LocalSeleniumsession.prototype = new Basesession();

//https://code.google.com/p/selenium/wiki/DesiredCapabilities
LocalSeleniumsession.type = {
    "IE": {
        browserName: 'internet explorer',
        ignoreProtectedModeSettings: true
    },
    "FF": {
        browserName: "firefox",
        version: "22",
        firefox_binary: "C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe -url www.google.com"
        //firefox_profile
    },
    "Cr": {
        browserName: "chrome"
    }
};

LocalSeleniumsession.prototype.requestStart = function () {
    //ignore, the session is started in the constructor
};

LocalSeleniumsession.prototype.requestStop = function () {
    //ignore, local sessions can be up until they timeout long as we want
};

LocalSeleniumsession.prototype.toString = function () {
    return "session<local, " + this._capabilities.browserName + ">";
};

return LocalSeleniumsession;
}($selenium$47Basesession,$tools$47node$45wrappers$47console,$richard$47test));
var $tess$47runners$47Runner = (function (objLoop) {

function Runner() {
}

Runner.prototype.timeout = 5000; //five seconds
Runner.prototype.run = function (code, openDebugger) {
};

Runner.prototype.toString = function () {
    return this.constructor.name;
}

Runner.prototype.provides = function (namespace) {
    if (!this.hasOwnProperty("_provides")) {
        this._provides = {};
    }
    this._provides[namespace] = true;
};

Runner.prototype.findMissingMatches = function (expectations) {
    var self = this;
    var missingMatches = [];
    if (!self.hasOwnProperty("_provides")) {
        self._provides = {};
    }
    objLoop(expectations, function (varName, expectation) {
        if (!self._provides.hasOwnProperty(expectation.url)) {
            missingMatches.push(expectation.url);
        }
    });
    return missingMatches;
};
return Runner;
}($tools$47objLoop));
var $tess$47runners$47Selenium$47SeleniumRunner = (function (Runner,RequestHandler,objLoop,rsvp,test) {

function resultCallerCode(postUrl) {
    return "" +
        //copy seleniumResultcallback code here
        '(function() {\n' +
        '"use strict";\n' +
        'var $tools$47createXMLHTTPObject = (function () {\n' +
        '\n' +
        'function createXMLHTTPObject() {\n' +
        '    var XMLHttpFactories = [\n' +
        '        function () {return new XMLHttpRequest();},\n' +
        '        function () {return new ActiveXObject("MSXML2.XMLHTTP.3.0");},\n' +
        '    ];\n' +
        '    var xmlhttp, \n' +
        '        i,\n' +
        '        e;\n' +
        '    for (i = 0; i < XMLHttpFactories.length; i += 1) {\n' +
        '        try {\n' +
        '            xmlhttp = XMLHttpFactories[i]();\n' +
        '        } catch (e) {\n' +
        '            continue;\n' +
        '        }\n' +
        '        break;\n' +
        '    }\n' +
        '    return xmlhttp;\n' +
        '}\n' +
        'return createXMLHTTPObject;\n' +
        '}());\n' +
        'var $tess$47runners$47Selenium$47seleniumResultcallback = (function (createXMLHTTPObject) {\n' +
        '\n' +
        'var postUrl = ' + JSON.stringify(postUrl) + ';\n' +
        '\n' +
        'function finishRun(passed, details) {\n' +
        '    var req = createXMLHTTPObject();\n' +
        '    req.open("POST", postUrl, true);\n' +
        '    req.setRequestHeader("Content-type","application/json");\n' +
        '    req.send(JSON.stringify({passed: passed, details: details}));\n' +
        '}\n' +
        '\n' +
        'window.onerror = function(errorMsg, url, lineNumber) {\n' +
        '    url = url.substr((window.location.protocol+"//"+window.location.host+"/runtest").length);\n' +
        '    finishRun({"run error": [url, lineNumber, errorMsg]});\n' +
        '};\n' +
        '\n' +
        'window.resultCallback = finishRun;\n' +
        '\n' +
        '}($tools$47createXMLHTTPObject));\n' +
        '\n' +
        '}());';
}

function compiledWebdriverCode(seleniumProxyUrl) {
    return "" +
        //copy webdriver code here
        '(function() {\n' +
        '"use strict";\n' +
        'var $tools$47createXMLHTTPObject = (function () {\n' +
        '\n' +
        'function createXMLHTTPObject() {\n' +
        '    var XMLHttpFactories = [\n' +
        '        function () {return new XMLHttpRequest();},\n' +
        '        function () {return new ActiveXObject("MSXML2.XMLHTTP.3.0");},\n' +
        '    ];\n' +
        '    var xmlhttp, \n' +
        '        i,\n' +
        '        e;\n' +
        '    for (i = 0; i < XMLHttpFactories.length; i += 1) {\n' +
        '        try {\n' +
        '            xmlhttp = XMLHttpFactories[i]();\n' +
        '        } catch (e) {\n' +
        '            continue;\n' +
        '        }\n' +
        '        break;\n' +
        '    }\n' +
        '    return xmlhttp;\n' +
        '}\n' +
        'return createXMLHTTPObject;\n' +
        '}());\n' +
        'var $tools$47global = (function () {\n' +
        '\n' +
        '/*jshint evil:true*/\n' +
        '\n' +
        '// To be cross compatible across different js platforms you need a way to access the global object (i.e. the window\n' +
        '// object in the browser). This can usually be achieved by returning "this" from a function that is not called as a \n' +
        '// method. \n' +
        '\n' +
        '// Strict mode, however, throws an error when you do this. Calling the Function constructor with eval-able code gets \n' +
        '// around this because that code is then automatically somewhat outside \'use strict\'.\n' +
        '\n' +
        '// yes this is obscure and hackish, hence the long explanation and the jshint pragma.\n' +
        'return new Function(\'return this\')();\n' +
        '}());\n' +
        'var $tess$47runners$47Selenium$47clientsideWebdriver = (function (createXMLHTTPObject,global) {\n' +
        '\n' +
        'var seleniumProxyUrl = ' + JSON.stringify(seleniumProxyUrl) + ';\n' +
        'function Webdriver() {\n' +
        '    this._procyUrl = seleniumProxyUrl;\n' +
        '}\n' +
        '\n' +
        'Webdriver.data = {};\n' +
        '\n' +
        'Webdriver.prototype._xhr = function (verb, url, body, callback) {\n' +
        '    var req = createXMLHTTPObject();\n' +
        '    \n' +
        '    req.open("POST", this._procyUrl, true);\n' +
        '    req.setRequestHeader("Content-type","application/json");\n' +
        '\n' +
        '    req.send(JSON.stringify({method: verb, path: url, data: body}));\n' +
        '\n' +
        '    req.onreadystatechange = function () {\n' +
        '        var res;\n' +
        '        if (req.readyState === 4){ //request is done\n' +
        '            if (req.status === 200) {\n' +
        '                res = JSON.parse(req.responseText);\n' +
        '                if (res.statusCode >= 200 && res.statusCode <= 299) {\n' +
        '                    callback(undefined, res.body);\n' +
        '                } \n' +
        '            } else {\n' +
        '                callback(res, undefined);\n' +
        '            }\n' +
        '        }\n' +
        '    };\n' +
        '};\n' +
        '\n' +
        'Webdriver.prototype.keys = {\n' +
        '    "NULL": "\\uE000",\n' +
        '    "Cancel": "\\uE001",\n' +
        '    "Help": "\\uE002",\n' +
        '    "Backspace": "\\uE003",\n' +
        '    "Tab": "\\uE004",\n' +
        '    "Clear": "\\uE005",\n' +
        '    "Enter": "\\uE006",\n' +
        '    "Numpad enter": "\\uE007",\n' +
        '    "Shift": "\\uE008",\n' +
        '    "Control": "\\uE009",\n' +
        '    "Alt": "\\uE00A",\n' +
        '    "Pause": "\\uE00B",\n' +
        '    "Escape": "\\uE00C",\n' +
        '    "Space": "\\uE00D",\n' +
        '    "Pageup": "\\uE00E",\n' +
        '    "Pagedown": "\\uE00F",\n' +
        '    "End": "\\uE010",\n' +
        '    "Home": "\\uE011",\n' +
        '    "Left arrow": "\\uE012",\n' +
        '    "Up arrow": "\\uE013",\n' +
        '    "Right arrow": "\\uE014",\n' +
        '    "Down arrow": "\\uE015",\n' +
        '    "Insert": "\\uE016",\n' +
        '    "Delete": "\\uE017",\n' +
        '    "Semicolon": "\\uE018",\n' +
        '    "Equals": "\\uE019",\n' +
        '    "Numpad 0": "\\uE01A",\n' +
        '    "Numpad 1": "\\uE01B",\n' +
        '    "Numpad 2": "\\uE01C",\n' +
        '    "Numpad 3": "\\uE01D",\n' +
        '    "Numpad 4": "\\uE01E",\n' +
        '    "Numpad 5": "\\uE01F",\n' +
        '    "Numpad 6": "\\uE020",\n' +
        '    "Numpad 7": "\\uE021",\n' +
        '    "Numpad 8": "\\uE022",\n' +
        '    "Numpad 9": "\\uE023",\n' +
        '    "Multiply": "\\uE024",\n' +
        '    "Add": "\\uE025",\n' +
        '    "Separator": "\\uE026",\n' +
        '    "Subtract": "\\uE027",\n' +
        '    "Decimal": "\\uE028",\n' +
        '    "Divide": "\\uE029",\n' +
        '\n' +
        '    "F1": "\\uE031",\n' +
        '    "F2": "\\uE032",\n' +
        '    "F3": "\\uE033",\n' +
        '    "F4": "\\uE034",\n' +
        '    "F5": "\\uE035",\n' +
        '    "F6": "\\uE036",\n' +
        '    "F7": "\\uE037",\n' +
        '    "F8": "\\uE038",\n' +
        '    "F9": "\\uE039",\n' +
        '    "F10": "\\uE03A",\n' +
        '    "F11": "\\uE03B",\n' +
        '    "F12": "\\uE03C",\n' +
        '    "Command/Meta": "\\uE03D"\n' +
        '};\n' +
        '\n' +
        'Webdriver.prototype._getSeleniumHandle = function (domElement, callback) {\n' +
        '    window.Webdriver.data.domElement = domElement;\n' +
        '    this._xhr(\n' +
        '        "POST", \n' +
        '        "execute", \n' +
        '        { \n' +
        '            script: "var top = window; while(!top.hasOwnProperty(\'Webdriver\') && top !== window.parent) { top = window.parent } return top.Webdriver.data.domElement;", \n' +
        '            args: [] \n' +
        '        }, \n' +
        '        function (err, result) {\n' +
        '            callback(err, result ? result.value.ELEMENT : undefined);\n' +
        '        }\n' +
        '    );\n' +
        '};\n' +
        '\n' +
        'Webdriver.prototype.sendKeys = function (domElement, text, callback) {\n' +
        '    var self = this;\n' +
        '    this._getSeleniumHandle(domElement, function(handle){\n' +
        '        var data = [], \n' +
        '            i;\n' +
        '        for (i = 0; i < text.length; i += 1){ //turn strings into an array\n' +
        '            data.push(text[i]);\n' +
        '        }\n' +
        '        self._xhr(\n' +
        '            "POST", \n' +
        '            "element/" + handle + "/value", \n' +
        '            {value: data}, \n' +
        '            callback\n' +
        '        );\n' +
        '    });\n' +
        '};\n' +
        '\n' +
        'Webdriver.prototype.click = function (domElement, callback) {\n' +
        '    var self = this;\n' +
        '    var element = this._getSeleniumHandle(domElement, function(handle){\n' +
        '        self._xhr(\n' +
        '            "POST", \n' +
        '            "element/" + handle + "/click", \n' +
        '            undefined,\n' +
        '            callback\n' +
        '        );\n' +
        '    });\n' +
        '};\n' +
        '\n' +
        'Webdriver.prototype.switchTo = function (frameId, callback) {\n' +
        '    this._xhr(\n' +
        '        "POST", \n' +
        '        "frame/", \n' +
        '        { id: frameId }, \n' +
        '        callback\n' +
        '    );\n' +
        '};\n' +
        '\n' +
        'global.Webdriver = Webdriver;\n' +
        '}($tools$47createXMLHTTPObject,$tools$47global));\n' +
        '\n' +
        '}());\n';
}

function SeleniumRunner(session, kickoffPrefix) {
    var id,
        self = this;

    self.queue = rsvp.promise();
    self.queue.fulfill(); //trigger start;

    self.runs = {};

    self.provides("http://jauco.nl/applications/jester/1/webdriver");
    self.provides("http://jauco.nl/applications/jester/1/resultCallback");
    self.provides("http://developer.mozilla.org/en-US/docs/DOM/console.log");

    self._session = session;
    self._kickoffPrefix = kickoffPrefix;

    self._requestHandler = new RequestHandler(
        ["sendResults", "requestData"], {

        "/run/{*}": function testPage(runId, query, sendResults, requestData) {
            var generator = self.testPageGenerator,
                resultCallerUrl = this.urlFor["resultCaller"](runId),
                clientsideWebdriverUrl = this.urlFor["webdriverCode"](),
                codeUrl = this.urlFor["code"](runId),
                
                result = generator(runId, resultCallerUrl, clientsideWebdriverUrl, codeUrl);
            sendResults(result);
        },

        "/run/{*}/code.js": function code(runId, query, sendResults, requestData) {
            sendResults(self.runs[runId].code);
        },

        "/run/{*}/resultCaller.js": function resultCaller(runId, query, sendResults, requestData) {
            sendResults(resultCallerCode(this.urlFor["finish"](runId)));
        },

        "/run/{*} (POST)": function finish(runId, query, sendResults, requestData) {
            var result = {};
            if (requestData) {
                result = JSON.parse(requestData);
            }
            sendResults("");
            self._session.requestStop();
            self.runs[runId].promise.fulfill(result);
        },

        "/webdriver.js": function webdriverCode(query, sendResults, requestData) {
            sendResults(compiledWebdriverCode(this.urlFor["webdriverCall"]()));
        },

        "/webdriver (POST)": function webdriverCall(query, sendResults, requestData) {
            var webDriverRequest = {};
            if (requestData) {
                webDriverRequest = JSON.parse(requestData);
            }
            self._session
                .sendWireCommand(webDriverRequest.method, webDriverRequest.path, webDriverRequest.data)
                .always(function (promise) {
                    sendResults(JSON.stringify(promise.valueOf()));
                });
        }
    });
}

SeleniumRunner.prototype = new Runner();

SeleniumRunner.prototype.handle = function () {
    this._requestHandler.handle.apply(this._requestHandler, arguments);
};

var id = 0;
SeleniumRunner.prototype.run = function (code, useDebugger) {
    var self = this;
    var runId = id++;
    self.runs[runId] = {
        code: code,
        useDebugger: useDebugger,
        promise: rsvp.promise()
    };
    var thisRunPromise = self.queue.then(function () {
        self._session.requestStart();
        self._session.openUrl(self._kickoffPrefix + self._requestHandler.urlFor["testPage"](runId), useDebugger);
        return self.runs[runId].promise;
    });

    self.queue = thisRunPromise;
    
    return thisRunPromise;
};

SeleniumRunner.prototype.testPageGenerator = function testPageGenerator(runId, resultCallerUrl, webdriverUrl, codeUrl) {
    return "<html>\n" +
        "<script src='" + resultCallerUrl + "'></script>\n" +
        "<script src='" + webdriverUrl + "'></script>\n" + 
        "<script src='" + codeUrl + "'></script>\n" +
        "</html>";
};

SeleniumRunner.prototype.toString = function () {
    return "<Seleniumrunner: " + this._session + ">";
};

return SeleniumRunner;
}($tess$47runners$47Runner,$tools$47requestHandler,$tools$47objLoop,$tools$47rsvp,$richard$47test));
var $tools$47node$45wrappers$47child_process = (function () {

return require('child_process');
}());
var $tess$47runners$47Node$47NodeRunner = (function (Runner,rsvp,path,fs,child_process) {

var os = require('os');

var NodeRunnerProvides = [
    "http://jauco.nl/applications/jester/1/resultCallback",

    "http://developer.mozilla.org/en-US/docs/DOM/console.log",

    "http://www.w3.org/TR/html5/webappapis.html#timers",

    //FIXME: be able to parse commonjs modules so we can include these as a dependency instead of an expectation
    "https://npmjs.org/package/js-yaml",
    "https://npmjs.org/package/jshint",
    "https://npmjs.org/package/node-inspector",
    "https://github.com/mishoo/UglifyJS",

    "http://nodejs.org/api/assert.html",
    "http://nodejs.org/api/buffer.html",
    "http://nodejs.org/api/addons.html",
    "http://nodejs.org/api/child_process.html",
    "http://nodejs.org/api/cluster.html",
    "http://nodejs.org/api/crypto.html",
    "http://nodejs.org/api/debugger.html",
    "http://nodejs.org/api/dns.html",
    "http://nodejs.org/api/domain.html",
    "http://nodejs.org/api/events.html",
    "http://nodejs.org/api/fs.html",
    "http://nodejs.org/api/globals.html",
    "http://nodejs.org/api/http.html",
    "http://nodejs.org/api/https.html",
    "http://nodejs.org/api/modules.html",
    "http://nodejs.org/api/net.html",
    "http://nodejs.org/api/os.html",
    "http://nodejs.org/api/path.html",
    "http://nodejs.org/api/process.html",
    "http://nodejs.org/api/punycode.html",
    "http://nodejs.org/api/querystring.html",
    "http://nodejs.org/api/readline.html",
    "http://nodejs.org/api/stdio.html",
    "http://nodejs.org/api/stream.html",
    "http://nodejs.org/api/string_decoder.html",
    "http://nodejs.org/api/timers.html",
    "http://nodejs.org/api/tls.html",
    "http://nodejs.org/api/tty.html",
    "http://nodejs.org/api/dgram.html",
    "http://nodejs.org/api/url.html",
    "http://nodejs.org/api/util.html",
    "http://nodejs.org/api/vm.html",
    "http://nodejs.org/api/zlib.html"
];

function NodeRunner(parameters, tmpDir) {
    var self = this;
    self.runId = 0;
    self.tmpDir = tmpDir;
    self.queue = rsvp.promise();
    self.queue.fulfill(); //trigger start;
    NodeRunnerProvides.map(function (namespace) { 
        self.provides(namespace); 
    });
}
NodeRunner.prototype = new Runner();

NodeRunner.prototype.toString = function () {
    return "<Noderunner>";
};

NodeRunner.prototype.run = function(code, useDebugger) {
    var self = this,
        result = { passed: true, details: [] },
        runId = self.runId++;
    self.queue = self.queue.then(function () {
        var promise = rsvp.promise(),
            debugrun,
            moduleFile = path.join(self.tmpDir, "runfile_" + runId + ".js"),
            resultFile = path.join(self.tmpDir, "result_" + runId + ".json");
        code = 
            'var resultCallback = (function () {\n' +
            '    var wasCalled = false;\n' +
            '    return function resultCallback(passed, details) {\n' +
            '        if (wasCalled) {\n' +
            '            throw new Error("resultCallback should only be called once.")\n' +
            '        } else {\n' +
            '            var fs = require("fs");\n' +
            '            var result = JSON.stringify({passed: passed, details: details});\n' +
            '            fs.writeFile(' + JSON.stringify(resultFile) + ', result, "utf-8");\n' +
            '        }\n' +
            '    }\n' +
            '}());\n' +
            code;
        fs.unlink(resultFile, function () {
            fs.writeFile(moduleFile, code, "utf-8", function () {
                var nodecmd = "node.exe" + (useDebugger ? " --debug-brk " : " ");
                if (useDebugger) {
                    console.log("Running with --debug-brk");
                }
                debugrun = child_process.exec(nodecmd + moduleFile, function (p, stdout, stderr) {
                    if (stdout.length > 0) {
                        console.log(stdout);
                    }
                    if (stderr.length > 0) {
                        console.log(stderr);
                    }
                    fs.readFile(resultFile, "utf-8", function (err, content) {
                        var result;
                        if (content === undefined) {
                            result = {passed: false, details: ["No Result file generated."]};
                        }
                        else {
                            try {
                                result = JSON.parse(content);
                            } catch(e) {
                                console.log("Result to parse: '" + content + "'");
                                throw e;
                            }
                        }
                        if (!promise.isResolved()) {
                            promise.fulfill(result);
                        }
                    });
                });
                if (useDebugger) {
                    setTimeout(function () {
                        console.log("launching graphic debugger (open https://localhost:8080 in your browser)");
                        child_process.exec(".\\node_modules\\.bin\\node-inspector.cmd", function (err, stdout, stderr) {
                            if (stdout.length > 0) {
                                console.log(stdout);
                            }
                            if (stderr.length > 0) {
                                console.log(stderr);
                            }
                        });
                    }, 2000);
                }
            });
        });
        if (!useDebugger) {
            setTimeout(function () {
                if (!promise.isResolved()) {
                    if (os.platform().substr(0,3) === "win") {
                        child_process.exec("taskkill /PID " + debugrun.pid + " /F /t", function () {console.log("Tried to kill debugging session:", arguments);});
                    } else {
                        debugrun.kill("SIGTERM");
                    }
                    result.passed = false; 
                    result.details.push("timeout during test run. (file: " + moduleFile + ")"); 
                    promise.fulfill(result); 
                }
            }, 10 * 1000);
        }
        return promise;
    });
    return self.queue;
};

return NodeRunner;
}($tess$47runners$47Runner,$tools$47rsvp,$tools$47node$45wrappers$47path,$tools$47node$45wrappers$47fs,$tools$47node$45wrappers$47child_process));
var $igor$47runTests$47loadTestRunners = (function (map,path,rsvp,mkdirP,Saucesession,LocalSeleniumsession,SeleniumRunner,NodeRunner) {

function loadTestRunners(writeLog, testSystem, webserver, seleniumServer, runners, saucelabsUrl, saucelabsUser, saucelabsKey, outputDirectory) {
    var seleniumRunners = {};
    webserver.addMatch(["requestData", "sendResults"], "/runner/{*}/...", function gets(runnerId, restMatch, query, requestData, sendResults) {
        seleniumRunners[runnerId].handle(this.request, this.response, {sendResults: sendResults, requestData: requestData}, restMatch);
    });
    webserver.addMatch(["requestData", "sendResults"], "/runner/{*}/... (POST)", function posts(runnerId, restMatch, query, requestData, sendResults) {
        seleniumRunners[runnerId].handle(this.request, this.response, {sendResults: sendResults, requestData: requestData}, restMatch);
    });

    function launchSeleniumRunner(index, sessionMaker) {
        var prefix = "/runner/" + index;
        seleniumRunners[index] = new SeleniumRunner(sessionMaker(), "http://" + webserver.hostname + ":" + webserver.port + prefix);
        testSystem.addRunner(seleniumRunners[index]);
    }
    map(runners, function (runner, index) {
        switch (runner.type) {
        case 'phantomjs':
            //not implemented yet
            break;
        case 'sauce':
            launchSeleniumRunner(index, function () { return new Saucesession(saucelabsUrl, saucelabsUser, saucelabsKey, runner.parameters.browserType, runner.parameters.keepAlive); });
            break;
        case 'selenium':
            seleniumServer.then(function (server) {
                launchSeleniumRunner(index, function () { return new LocalSeleniumsession(server.serverUrl, runner.parameters.browserType); });
            });
            break;
        case 'node':
            var tmpDir = path.join(outputDirectory, "runnerTmp", index + "");
            mkdirP(tmpDir, function (err) {
                if (!err) {
                    testSystem.addRunner(new NodeRunner(runner.parameters, tmpDir));
                } else {
                    writeLog(0, "Couldn't launch node runner, because the directory that will hold the node scripts couldn't be created");
                    writeLog(1, err+"");
                }
            });
            break;
        case 'rhino':
            //not implemented yet
            break;
        default:
            writeLog(0, "Could not launch runner of type: '" + runner.type + "'");
        }
    });
}
return loadTestRunners;
}($tools$47map,$tools$47node$45wrappers$47path,$tools$47rsvp,$tools$47mkdirP,$selenium$47Sauce$47Saucesession,$selenium$47Local$47LocalSeleniumsession,$tess$47runners$47Selenium$47SeleniumRunner,$tess$47runners$47Node$47NodeRunner));
var $tools$47node$45wrappers$47os = (function () {

return require("os");
}());
var $selenium$47Local$47LaunchSeleniumServer = (function (rsvp,child_process,os,http,url,test,createSpy,any,fs) {

function Seleniumserver(child_process, port, command_line) {
    var self = this;
    self.serverUrl = 'http://localhost:' + port + '/wd/hub';
    self._process = child_process;
    self._command_line = command_line;

    self.isRunning = undefined;
}

Seleniumserver.prototype.dispose = function () {
    var self = this;
    if (os.platform().substr(0,3) === "win") {
        //nasty workaround for the fact that node child_processe's report the wrong PID
        child_process.exec("taskkill /PID " + self._process.pid + " /F /t");
    } else {
        self._process.kill("SIGTERM");
    }
    return self._waitFor(false).then(function () { self.isRunning = false; });
};

Seleniumserver.prototype._ping = function (callback, timeout) {
    var self = this;
    var opts = url.parse(self.serverUrl);
    opts.method = "GET";
    opts.headers = {
        "Accept": "application/json;charset=UTF-8",
        "Content-Type": "application/json;charset=UTF-8"
    };

    var request = http.get(opts, function(res) {
        if (!request.callbackWasCalled) {
            request.callbackWasCalled = true;
            callback(res.statusCode === 200);
        }
    });
    request.setTimeout(timeout, function(e) {
        request.abort();
        if (!request.callbackWasCalled) {
            request.callbackWasCalled = true;
            callback(false);
        }
    });
    request.once('error', function(e) {
        request.abort();
        if (!request.callbackWasCalled) {
            request.callbackWasCalled = true;
            callback(false);
        }
    });
    self._runningRequest = request;
    request.callbackWasCalled = false;
    return request;
};

Seleniumserver.prototype._waitFor = function (targetState) {
    var promise = rsvp.promise();
    var self = this;
    
    var currentTry = 0;
    var timeout = 200;
    var maxTryCount = 50; //200 * 50 = 10000 is roughly ten seconds
    
    function isItUpYet(isUp) {
        if (isUp === targetState) {
            self.isRunning = isUp;
            promise.fulfill();
        } else if (self.isRunning === targetState) { //an external factor caused the targetstate to be reached
            promise.fulfill();
        } else if (currentTry++ < maxTryCount) {
            self._ping(isItUpYet, timeout); //try again
        } else {
            promise.reject(); //not gonna happen
        }
    }
    self._ping(isItUpYet, timeout);
    return promise;
};

function LaunchSeleniumServer(port, jarLocation, chromedriverLocation, iedriverLocation) {
    var command_line = 'java -jar ' + JSON.stringify(jarLocation);
    if (typeof chromedriverLocation === "string") {
        command_line += ' "-Dwebdriver.chrome.driver=' + chromedriverLocation + '"';
    }
    if (typeof iedriverLocation === "string") {
        command_line += ' "-Dwebdriver.ie.driver=' + iedriverLocation + '"';
    }
    command_line += ' -port ' + port;

    var javaCommand = child_process.exec(command_line);

    var server = new Seleniumserver(javaCommand, port, command_line);
    return server._waitFor(true).then(function () { return server; });
}
return LaunchSeleniumServer;
}($tools$47rsvp,$tools$47node$45wrappers$47child_process,$tools$47node$45wrappers$47os,$tools$47node$45wrappers$47http,$tools$47node$45wrappers$47url,$richard$47test,$richard$47createSpy,$richard$47any,$tools$47node$45wrappers$47fs));
var $igor$47loadconfig = (function (map,test) {

// "()" exceptionHandler:
//     exceptionHandler <- "Error: invalid config"
//     loaded_config as returnvalue

//     loaded_config:
//         ".includes":
//             hashMap<absolutePath> as returnvalue
//         ".source": 
//             absolutePath as returnvalue
//         ".output": 
//             absolutePath as returnvalue
//         ".entrypoints": 
//             array<string> as returnvalue
//         ".testrunner": 
//             string as returnvalue
    
//     absolutePath:
//         string+
//         "<absolute path>":
//         "<ends with pathsep>":

var path = require('path'),
    fs = require('fs');

function dirSpecToPath(baseDir, dirSpec) {
    return path.resolve(baseDir, "./" + dirSpec) + path.sep;
}

function loadConfig(configPath, appPath) {
    var key,
        errors = [],
        paths = [],
        configdir = path.dirname(configPath),
        config = JSON.parse(fs.readFileSync(configPath, "utf8"));

    function test(result, error) {
        if (!result) {
            errors.push(error);
        }
    }
    test(config.hasOwnProperty("output"), "The configuration file is missing the 'output' property.");
    config.output = dirSpecToPath(configdir, config.output);
    test(fs.existsSync(config.output), "The specified output directory does not exist: " + config.output);
    paths.push(config.output);

    test(config.hasOwnProperty("includes"), "The configuration file is missing the 'includes' property.");
    for (key in config.includes) {
        if (config.includes.hasOwnProperty(key)) {
            config.includes[key] = dirSpecToPath(configdir, config.includes[key]);
            test(fs.existsSync(config.includes[key]), "The specified include directory does not exist: " + config.includes[key]);
            paths.push(config.includes[key]);
        }
    }

    //throw error if an include is a subdir of another include or source
    var dirsThatAreSubdirsOfOtherDirs = map(paths, function (subdir) {
        var parentDirs = paths.filter(function (parentDir) { return subdir.indexOf(parentDir) > -1 && subdir !== parentDir; });
        test(parentDirs.length === 0, subdir + "is a subdirectory of: " + parentDirs.join(", "));
    });

    if (config.runners) {
        config.runners = map(config.runners, function (data) { return { type: data[0], parameters: data[1] }; });
    } else {
        config.runners = [];
    }
    if (!config.lintpreferences) {
        config.lintpreferences = {};
    }
    if (!config.webserverport) {
        config.webserverport = 8081;
    }
    if (!config.graphicDebuggerport) {
        config.graphicDebuggerport = 8080;
    }
    if (!config.selenium) {
        config.selenium = {};
    }
    if (!config.selenium.binaries) {
        config.selenium.binaries = {};
    }
    if (!config.selenium.port) {
        config.selenium.port = 8082;
    }
    if (!config.selenium.binaries.seleniumServer) {
        config.selenium.binaries.seleniumServer = path.join(appPath, "selenium-server-standalone-2.19.0.jar");
    }
    if (!config.selenium.binaries.chromedriver) {
        config.selenium.binaries.chromedriver = path.join(appPath, "chromedriver.exe");
    }
    if (!config.selenium.binaries.iedriver) {
        config.selenium.binaries.iedriver = path.join(appPath, "IEDriver_x64_2.33.0.exe");
    }
    if (!config.saucelabs) {
        config.saucelabs = {};
    }
    if (!config.saucelabs.url) {
        config.saucelabs.url = "http://localhost:4445/wd/hub";
    }
    test(config.saucelabs.hasOwnProperty("username"), "You should provide a username for accessing saucelabs.");
    test(config.saucelabs.hasOwnProperty("key"), "You should provide a key for accessing saucelabs (hexadecimal token string).");
    if (errors.length > 0) {
        throw new Error(errors.join("\n"));
    }
    return config;
}
return loadConfig;
}($tools$47map,$richard$47test));
var $igor$47runTests$47debugRequested = (function () {

function debugRequested(code) {
    return code.indexOf("debug" + "ger;") > -1; //fixme: parse the code and detect actual debug statement
}
return debugRequested;
}());
var $igor$47runTests$47hasTestCode = (function () {

return function hasTestCode(module) {
    return module.testFunctionBody && module.testFunctionBody.trim().length > 0;//fixme: use a js parser and also fail if the contents is nothing but comments
};
}());
var $bob$47moduleTransformers$47moduleAsVariable = (function (test) {

// "()" AMDModule:
    
//     buildable:
//         "dependencies":
//             readOnlyArray as returnvalue
//             readOnlyArray:
//                 "[]" key:
//                     AMDModule <- ".dependencies" <- "[]" key as returnvalue
//                 "for(i)":
//                     AMDModule <- ".dependencies" <- "for(i)" as returnvalue

//         "code" dependencyVariableNames:
//             dependencyVariableNames <- "[]" integer
//             AMDModule <- "+ <validJsCode>;\n" as returnvalue
function amdIdToJsVariable(AMDid) {
    return "$" + AMDid.replace(/[^a-zA-Z_]/g, function (a) { return "$" + a.charCodeAt(0); });
}

function dali(template, values) { //a tiny moustache-like template parser. Ha. Ha. 
    return template.replace(/\{([a-zA-Z0-9_\-]+)\}/g, function(_, variable) { return values[variable]; });
}

function moduleAsVariable(AMDModule) {
    var variableName = amdIdToJsVariable(AMDModule.AMDid);

    return {
        AMDid: AMDModule.AMDid,
        dependencies: AMDModule.dependencies,
        code: function (dependencyVariableNameStore) {
            //test for missing dependency variables
            var varNames = AMDModule.dependencies.map(function (dep) { return dependencyVariableNameStore[dep]; });
            
            return dali(
                "var {objectName} = (function ({dependencies}) {\n" + 
                "{functionBody}\n" +
                "}({dependencyVariableNames}));\n",
                {
                    objectName: variableName,
                    dependencies: AMDModule.dependencyVariables.join(","),
                    functionBody: AMDModule.defineFunctionBody,
                    dependencyVariableNames: varNames.join(",")
                }
            );
        },
        variableName: variableName
    };
}
return moduleAsVariable;
}($richard$47test));
var $bob$47tools$47limitScope = (function (test,any,createSpy) {

// this.contract = runner.contract(this.AMDid, [], {
//     "()": function (jsCode) {
//         jsCode.send("<valid js>");

//         return runner.contract.str.extend("scope safe code", [], {
//             "<valid js>": runner.contract.undef,
//             "<scope safe>": runner.contract.undef
//         });
//     }
// });
function limitScope(jsCode) {
    return "(function() {\n" +
        "\"use strict\";\n" +
        jsCode + "\n" +
        "}());";
}
return limitScope;
}($richard$47test,$richard$47any,$richard$47createSpy));
var $bob$47tools$47getModuleAndDependencies = (function (map,test) {

// "()" id, moduleStore:

//     moduleStore <- "[]" id without "<nil>" as module
//     module <- ".dependencies" as dependencies
//     moduleStore <- "[]" dependencies without "<nil>" as module

//     return array<module>
function moduleExists(AMDModule, includedModules) {
    var i;
    for (i = 0; i < includedModules.length; i += 1) {
        if (includedModules[i] === AMDModule) {
            return true;
        }
    }
    return false;
}

function addModuleDependencies(result, AMDids, store, modulesThatAreBeingLoaded) {
    var i, AMDModule;
    for (i = 0; i < AMDids.length; i += 1) {
        if (modulesThatAreBeingLoaded.hasOwnProperty(AMDids[i])) {
            throw new Error("circular dependency somewhere in "+Object.keys(modulesThatAreBeingLoaded).join(", "));
        }
        AMDModule = store[AMDids[i]];
        if (AMDModule == null) {
            console.log(AMDids[i] + " is not available");
        } else {
            if (!moduleExists(AMDModule, result)) {
                modulesThatAreBeingLoaded[AMDids[i]] = true;
                addModuleDependencies(result, AMDModule.dependencies, store, modulesThatAreBeingLoaded);
                delete modulesThatAreBeingLoaded[AMDids[i]];
                result.push(AMDModule);
            }
        }
    }
}

function getModuleAndDependencies(id, store) {
    var result = [];
    addModuleDependencies(result, [id], store, {});
    return result;
}
return getModuleAndDependencies;
}($tools$47map,$richard$47test));
var $bob$47tools$47buildAllModulesInOneFile = (function (orderModules,reduce,test,createSpy) {

// var ct = runner.contract;
// this.contract = ct(this.AMDid, [], {
//     "()": function (module, AmdModules) {
//         module.send("<is string>?"); //will be used as the key in an object

//         var moduleArg = ct("module (assembleTestModule)", [], {"for(in)": ct.arr(module)});
//         var assembled = orderModules.contract.send("()", moduleArg, AmdModules);
//         var modules = assembled.send("for(i)");
//         modules.send(".inclusionReason").send("for(in)");
        
//         modules.send(".moduleCode()").send("<valid js>");

//         AmdModules.send("[]").send(".callExecuteCode()").send("<valid js>");
//         return limitScope.contract.send("()", ct.str.extend("assembledstring + executeCode", [], {
//             "<valid js>": ct.undef
//         }));
//     }
// });

function buildAllModulesInOneFile(AMDid, AmdModules) {
    var assembledString, dependencyStore = {};

    assembledString = reduce(
        orderModules(AMDid, AmdModules), 
        function (code, m) { 
            dependencyStore[m.AMDid] = m.variableName;
            return code + m.code(dependencyStore);
        },
        ""
    );

    return assembledString;
}
return buildAllModulesInOneFile;
}($bob$47tools$47getModuleAndDependencies,$tools$47reduce,$richard$47test,$richard$47createSpy));
var $bob$47moduleTransformers$47runModuleTest = (function () {

// "()" AMDModule:
    
//     buildable:
//         "dependencies":
//             readOnlyArray as returnvalue
//             readOnlyArray:
//                 "[]" key:
//                     AMDModule <- ".dependencies" <- "[]" key as returnvalue
//                 "for(i)":
//                     AMDModule <- ".dependencies" <- "for(i)" as returnvalue

//         "code" dependencyVariableNames:
//             dependencyVariableNames <- "[]" integer
//             AMDModule <- "+ <validJsCode>;\n" as returnvalue
function amdIdToJsVariable(AMDid) {
    return "$" + AMDid.replace(/[^a-zA-Z_]/g, function (a) { return "$" + a.charCodeAt(0); });
}

function ctorName(variableName) {
    return variableName + "_ctor";
}

function metaName(variableName) {
    return variableName + "_meta";
}

function dali(template, values) { //a tiny moustache-like template parser. Ha. Ha. 
    return template.replace(/\{([a-zA-Z0-9_-]+)\}/g, function(_, variable) { return values[variable]; });
}

function runModuleTest(AMDModule) {
    var variableName = amdIdToJsVariable(AMDModule.AMDid);

    return {
        dependencies: AMDModule.dependencies,
        code: function (dependencyStore) {
            //test for missing dependency variables
            var varNames = AMDModule.dependencies.map(function (dep) { return dependencyStore[dep]; });
            
            return dali(
                "(function (__module{dependencyVariableComma}{dependencies}) {\n" +
                "{testFunctionBody}\n" +
                "}({\n" +
                "  AMDid: {AMDid},\n" +
                "  constructor: function ({dependencies}) {\n" +
                "{functionBody}\n" +
                "}\n" +
                "}{dependencyVariableComma}{dependencyVariableNames}));\n",
                {
                    AMDid: JSON.stringify(AMDModule.AMDid),
                    testFunctionBody: AMDModule.testFunctionBody,
                    functionBody: AMDModule.defineFunctionBody,
                    dependencies: AMDModule.dependencyVariables.join(","),
                    dependencyVariableNames: varNames.join(","),
                    dependencyVariableComma: AMDModule.dependencyVariables.length > 0 ? ", " : ""
                }
            );
        },
        variableName: variableName
    };
}

return runModuleTest;
}());
var $bob$47buildTessTestfile = (function (objLoop,moduleAsVariable,limitScope,buildAllModulesInOneFile,runModuleTest) {

function buildTessTestfile(AMDidToTest, AmdModules) {
    var buildModules = objLoop(AmdModules, function (AMDid, module) { 
        var isModuleToTest = (AMDid === AMDidToTest);
        if (isModuleToTest) {
            return runModuleTest(module);
        } else {
            return moduleAsVariable(module);
        }
    });
    return limitScope(buildAllModulesInOneFile(AMDidToTest, buildModules));
}
return buildTessTestfile;
}($tools$47objLoop,$bob$47moduleTransformers$47moduleAsVariable,$bob$47tools$47limitScope,$bob$47tools$47buildAllModulesInOneFile,$bob$47moduleTransformers$47runModuleTest));
var $igor$47runTests$47runTests = (function (map,rsvp,debugRequested,hasTestCode,buildTessTestfile,test,createSpy) {

function runTest(AMDid, snapshot, testSystem, writeLog) {
    var module = snapshot[AMDid];
    if (!hasTestCode(module)) {
        writeLog(0, "No tests were run, because no tests were defined.");
    } else {
        var promise = rsvp.promise();
        
        var testCode = buildTessTestfile(AMDid, snapshot);
        var debugWasRequested = debugRequested(testCode);
        var runnerRequirements = module.expectations;

        testSystem.runTest(testCode, runnerRequirements, debugWasRequested, function handleResults(result) {
            if (result.runners.length === 0) {
                writeLog(0, "No tests were run, because no capable runners are registered.");
                promise.fulfill();
            } else {
                if (result.passed) {
                    writeLog(0, "unit tests succeeded on " + result.runner + "!");
                    promise.fulfill();
                } else {
                    writeLog(0, "unit tests failed on" + result.runner + ".");
                    writeLog(1, result.details);
                    promise.reject();
                }
            }
        });
        return promise;
    }
}
return runTest;
}($tools$47map,$tools$47rsvp,$igor$47runTests$47debugRequested,$igor$47runTests$47hasTestCode,$bob$47buildTessTestfile,$richard$47test,$richard$47createSpy));
var $douglas$47jshint = (function () {

return require("jshint").JSHINT;
}());
var $douglas$47main = (function (jshint,map,test,createSpy,any) {

return function (code, settings, globals) {
    var testResult = jshint(code, settings, globals);
    var errors = testResult ? [] : jshint.errors;
    errors = map(errors, function (error) {
        if (error) {
            var location = error.line + "," + error.character + ": ";
            var indent = new Array(location.length).join(" ") + " ";
            return location + error.evidence + "\n" + indent + error.reason + " (" + error.code + ")";
        }
    });

    return {
        passed: testResult,
        details: errors
    };
};
}($douglas$47jshint,$tools$47map,$richard$47test,$richard$47createSpy,$richard$47any));
var $igor$47runLint$47runLint = (function (map,rsvp,objLoop,linter,test,createSpy) {

function reportResult(result, Module, writeLog) {
    if (result.passed) {
        writeLog(1, "No lint found in " + Module);
    } else {
        writeLog(1, "Lint found in " + Module);
        writeLog(2, result.details);
    }
}

function runLint(AMDid, snapshot, lintpreferences, writeLog) {
    var promise = rsvp.promise();
    var module = snapshot[AMDid];
    
    writeLog(0, "Running linter...");
    //module expectations are in scope
    var predefinedVariables = objLoop(module.expectations, function (key, value) {
        return false; //false indicates to jsHint that you may not assign to the variable;
    });
    //dependencies are in scope
    map(module.dependencyVariables, function (variableName) {
        predefinedVariables[variableName] = false;
    });
    
    //when evaluating the test code, __module is in scope as well
    predefinedVariables["__module"] = false;
    
    var testCodeResult = linter(module.testFunctionBody, lintpreferences, predefinedVariables);
    reportResult(testCodeResult, "ModuleTests", writeLog);

    delete predefinedVariables["__module"];

    var moduleCodeResult = linter(module.defineFunctionBody, lintpreferences, predefinedVariables);
    reportResult(moduleCodeResult, "Module", writeLog);

    if (testCodeResult.passed && moduleCodeResult.passed) {
        promise.fulfill();
    } else {
        promise.reject();
    }

    return promise;
}
return runLint;
}($tools$47map,$tools$47rsvp,$tools$47objLoop,$douglas$47main,$richard$47test,$richard$47createSpy));
var $bob$47buildOnedependencylessJsFile = (function (objLoop,moduleAsVariable,limitScope,buildAllModulesInOneFile) {

function buildTestCode(AMDid, AmdModules) {
    var buildModules = objLoop(AmdModules, function (AMDid, module) { return moduleAsVariable(module); });
    return limitScope(buildAllModulesInOneFile(AMDid, buildModules));
}
return buildTestCode;
}($tools$47objLoop,$bob$47moduleTransformers$47moduleAsVariable,$bob$47tools$47limitScope,$bob$47tools$47buildAllModulesInOneFile));
var $bob$47moduleTransformers$47moduleAsAMD = (function (map,test) {

function dali(template, values) { //a tiny moustache-like template parser. Ha. Ha. 
    return template.replace(/\{([a-zA-Z0-9_\-]+)\}/g, function(_, variable) { return values[variable]; });
}

function moduleAsAMD(AMDModule) {
    return {
        dependencies: [],
        code: function () {
            return dali(
                "define([{dependencies}], function ({dependencyVariables}) {\n" + 
                "{functionBody}\n" +
                "});\n",
                {
                    functionBody: AMDModule.defineFunctionBody,
                    dependencyVariables: AMDModule.dependencyVariables.join(","),
                    dependencies: map(AMDModule.dependencies, function(name) {return JSON.stringify(name);}).join(",")
                }
            );
        }
    };
}
return moduleAsAMD;
}($tools$47map,$richard$47test));
var $bob$47buildAMDfile = (function (moduleAsAMD) {

function buildAMDfile(AMDidToTest, AmdModules) {
    var module = AmdModules[AMDidToTest];
    return moduleAsAMD(module).code();
}
return buildAMDfile;
}($bob$47moduleTransformers$47moduleAsAMD));
var $bob$47tools$47createRelativeAMDid = (function (test) {

return function createRelativeAMDid(ownId, toId) {
    //based on node's path.relative
    
    var fromParts = ownId.split('/');
    var toParts = toId.split('/');

    var i;
    var samePartsLength;

    var length = Math.min(fromParts.length, toParts.length);
    for (i = 0; i < length; i++) {
        if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
        }
    }
    if (samePartsLength === undefined) {
        samePartsLength = length;
    }

    var outputParts = [];
    for (i = samePartsLength + 1; i < fromParts.length; i++) {
        outputParts.push('..');
    }

    outputParts = outputParts.concat(toParts.slice(samePartsLength));

    if (outputParts[0] && outputParts[0].substr(0,1) !== ".") {
        outputParts.unshift(".");
    }
    return outputParts.join('/');
};
}($richard$47test));
var $bob$47moduleTransformers$47moduleAsCommonJs = (function (map,createRelativeAMDid,test,createSpy) {

function dali(template, values) { //a tiny moustache-like template parser. Ha. Ha. 
    return template.replace(/\{([a-zA-Z0-9_\-]+)\}/g, function(_, variable) { return values[variable]; });
}

function moduleAsAMD(AMDModule) {
    return {
        dependencies: [],
        code: function () {
            var code = "";
            map(AMDModule.dependencies, function (dep, index) {
                code += dali("var {varname} = require({dependency});\n", {varname: AMDModule.dependencyVariables[index], dependency: JSON.stringify(createRelativeAMDid(AMDModule.AMDid, dep))});
            });
            code += dali(
                "module.exports = (function() {\n" +
                "{functionBody}\n" +
                "}());",
                {functionBody: AMDModule.defineFunctionBody}
            );
            return code;
        }
    };
}
return moduleAsAMD;
}($tools$47map,$bob$47tools$47createRelativeAMDid,$richard$47test,$richard$47createSpy));
var $bob$47buildCommonJsfile = (function (moduleAsCommonJs) {

function buildCommonJsfile(AMDidToTest, AmdModules) {
    var module = AmdModules[AMDidToTest];
    return moduleAsCommonJs(module).code();
}
return buildCommonJsfile;
}($bob$47moduleTransformers$47moduleAsCommonJs));
var $igor$47updateArtifacts$47walkDependants = (function (map) {

function walkDependants(module, snapshot, action, writtenModules, level) {
    if (!writtenModules) {
        writtenModules = {};
    }
    if (!level) {
        level = 0;
    }
    if (! writtenModules.hasOwnProperty(module)) {
        writtenModules[module] = true;
        action(module, snapshot, level);
        map(snapshot[module].dependants, function (dependant) {
            walkDependants(dependant, snapshot, action, writtenModules, level + 1);
        });
    }
}
return walkDependants;
}($tools$47map));
var $igor$47updateArtifacts$47writeFile = (function (path,fs,mkdirP) {

function writeFile(outputDir, filetype, AMDid, contents) {
    var dir = path.join(outputDir, filetype, path.dirname(AMDid));
    var filename = path.join(dir, path.basename(AMDid) + ".js");
    mkdirP(dir, function () {
        fs.writeFile(filename, contents);
    });
}
return writeFile;
}($tools$47node$45wrappers$47path,$tools$47node$45wrappers$47fs,$tools$47mkdirP));
var $igor$47updateArtifacts$47updateArtifacts = (function (buildOnedependencylessJsFile,buildAMDfile,buildCommonJsfile,walkDependants,writeFile) {

function updateArtifacts(AMDid, snapshot, outputDir, writeLog) {
    writeLog(0, "updating files");
    walkDependants(AMDid, snapshot, function write(module, snapshot, level) {
        writeLog(level + 1, "- " + snapshot[module].path);
        writeFile(outputDir, "concatenated", module, buildOnedependencylessJsFile(module, snapshot));
        writeFile(outputDir, "AMD", AMDid, buildAMDfile(module, snapshot));
        writeFile(outputDir, "CommonJs", AMDid, buildCommonJsfile(module, snapshot));
    });
}
return updateArtifacts;
}($bob$47buildOnedependencylessJsFile,$bob$47buildAMDfile,$bob$47buildCommonJsfile,$igor$47updateArtifacts$47walkDependants,$igor$47updateArtifacts$47writeFile));
var $igor$47main = (function (map,path,writeLog,getModules,TestSystem,Webserver,loadTestRunners,launchSeleniumServer,loadconfig,runTest,runLint,updateArtifacts,test,any,spy) {

var webserver, seleniumServer, moduleWatcherDisposer;
process.on('exit', function() {
    try {
        webserver.dispose();
    } catch (e) {}
    try {
        seleniumServer.valueOf().dispose();
    } catch (e) {}
    try {
        moduleWatcherDisposer();
    } catch (e) {}
});
process.on('SIGINT', function() {//catch ctrl-c and turn it into a clean exit.
    process.exit();
});
//relative to current location of the user
var config = loadconfig(path.resolve("./jester_config.json"), __dirname);

webserver = new Webserver();
webserver.start(config.webserverport);

seleniumServer = launchSeleniumServer(
    config.selenium.port,
    config.selenium.binaries.seleniumServer,
    config.selenium.binaries.chromedriver,
    config.selenium.binaries.iedriver
);

var testSystem = new TestSystem();

//start testrunners based on config
loadTestRunners(
    writeLog,
    testSystem,
    webserver,
    seleniumServer,
    config.runners,
    config.saucelabs.url,
    config.saucelabs.username,
    config.saucelabs.key,
    config.output
);

moduleWatcherDisposer = getModules(
    config.includes, 
    function onModuleChanged(errors, AMDid, snapshot) {
        if (!errors) {
            writeLog(0, "********************************************************************************");
            writeLog(0, snapshot[AMDid].path + " was updated.");

            var indentedWriter = writeLog.withIndent(1);
            runLint(AMDid, snapshot, config.lintpreferences, indentedWriter)
            .then(function () {
                return runTest(AMDid, snapshot, testSystem, indentedWriter);
            })
            // .then(function () {
            //     return runContracts(snapshot, indentedWriter);
            // })
            .then(function () {
                return updateArtifacts(AMDid, snapshot, config.output, indentedWriter);
            })
            .then(undefined, function (errors) {
                writeLog(0, errors ? errors.toString() : "An unknown error occurred.");
            });
        } else {
            writeLog(0, "Couldn't load '" + snapshot[AMDid].path + "'. ");
            writeLog(0, errors.stack);
        }
    },
    function onModuleDeleted(snapshot) {
        writeLog(0, "delete event");
        // runContracts(snapshot);
    }
);
}($tools$47map,$tools$47node$45wrappers$47path,$igor$47tools$47writeLog,$larry$47main,$tess$47main,$tools$47server,$igor$47runTests$47loadTestRunners,$selenium$47Local$47LaunchSeleniumServer,$igor$47loadconfig,$igor$47runTests$47runTests,$igor$47runLint$47runLint,$igor$47updateArtifacts$47updateArtifacts,$richard$47test,$richard$47any,$richard$47createSpy));

}());