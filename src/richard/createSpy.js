define(
    ["./expect/equals", "tools/map", "./expect/prettyPrint", "tools/objLoop"], 
    function (equals, map, prettyPrint, objLoop) {
        function createSpy() {
            function spy() {
                var i,
                    argumentMap = {},
                    result;
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
            if (typeof spy.result === 'function') {
                spy.argumentNames = spy.result.toString().split(')')[0].split('(')[1].split(/\s*,\s*/);
            }

            spy.expectMatchers = {
                toHaveBeenCalled: function () {
                    return this.actual.calls.length > 0;
                },
                toHaveBeenCalledWith: function () {
                    var mostRecentCall = this.actual.calls.length - 1,
                        equality;
                    if (mostRecentCall < 0){
                        this.message = function (seq) {
                            return "expected " + 
                                prettyPrint(this.actual) +
                                (this.isNot ? " not " : " ") +
                                "to have been called with:\n" +
                                map(arguments, prettyPrint).join(", ") + "\n" +
                                " but it was not called.\n";
                        }
                        return false;
                    }
                    equality = equals(this.actual.calls[mostRecentCall].args, arguments);
                    if (equality.passed) {
                        return true;
                    } else {
                        this.message = function (seq) {
                            var result;
                            if (this.isNot) {
                                return "No differences between the expected and actual calls: ";
                            } else {
                                result = "Differences between the expected and actual calls: ";
                                objLoop(equality.details, function (key, value) {
                                    result += "  '" + key + "' is " + prettyPrint(value[0]) + " instead of " + prettyPrint(value[1]) + ".\n";
                                })
                                return result;
                            }
                        }
                        return false;
                    }
                },
                toHaveBeenCalledWithTheSequence: function () {
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
                        this.message = function (seq) {
                            return "expected " + 
                                prettyPrint(this.actual) +
                                (this.isNot ? " not " : " ") +
                                "to have been called with the sequence:\n" +
                                prettyPrint(Array.prototype.slice.call(arguments)) + "\n" +
                                " but it was called with\n" +
                                prettyPrint(map(this.actual.calls, function (call) {return Array.prototype.slice.call(call.args);}));
                        }
                    }
                    return result;
                }
            }
            spy.toString = function () {
                return "<Spy for " + this.description + ">";
            }
            return spy;
        }
        return createSpy;
    }
);