define(["./prettyPrint", "../results/Result", "./equals", "./contains", "tools/objLoop"], function (prettyPrint, Result, equals, contains, objLoop) {
    function initMatcher(expectation, matcherName, matcherFunction) {
        expectation[matcherName] = function () {
            var result = matcherFunction.apply(expectation, arguments),
                message,
                englishyPredicate,
                i,
                argumentsAsArray = Array.prototype.slice.call(arguments);
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
                    englishyPredicate = matcherName.replace(/[A-Z]/g, function (s) { return ' ' + s.toLowerCase(); });
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
        // Really equal ===
        toBe: function (expected) {
            return this.actual === expected;
        },
        // roughly equal
        toEqual: function (expected) {
            var equal = equals(this.actual, expected);
            this.message = function (req) {
                var result = "differences found:\n";
                objLoop(equal.details, function (key, value) {
                    result += "  '" + key + "' is " + prettyPrint(value[0]) + " instead of " + prettyPrint(value[1]) + ".\n";
                })
                return result;
            }
            return equal.passed
        },
        toBeDefined: function () {
            return this.actual !== undefined;
        },
        toHave: function (expected) {
            return typeof this.actual.hasOwnProperty === "function" && this.actual.hasOwnProperty(expected);
        },
        toMatch: function (expected) {
            return (typeof this.actual === "string" || this.actual instanceof String) && new RegExp(expected).test(this.actual);
        },
        toHappen: function () {
            return true;
        },
        toBeTruthy: function () {
            return !!this.actual;
        },
        toBeFalsy: function () {
            return !this.actual;
        },
        toContain: function (expected) {
            return contains(this.actual, expected);
        },
        toBeLessThan: function (expected) {
            return this.actual < expected;
        },
        toBeGreaterThan: function (expected) {
            return this.actual > expected;
        },
        toThrow: function (expected) {
            var exception,
                result;
            if (typeof this.actual !== 'function') {
                result = false;
                this.message = function () {
                    return 'the action must be wrapped in a function for this to work i.e. expect(function () {someArray[20] += 1}).toThrow()';
                }
            } else {
                this.message = function () {
                    var message = "Expected function ",
                        expectedException = expected ? "'" + (expected.message || expected) + "'" : "an exception";
                    if (this.isNot) {
                        message += "not ";
                    }
                    message += "to throw " + expectedException;
                    if (exception) {
                        message += ", but it threw '" + (exception.message || exception)+"'";
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
        this.expect = expectFunc; //so you can call expect() inside an expect matcher

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
        expect.addMatcher = function (name, matcher) {
            customMatchers[name] = matcher;
        };
        return expect;
    }
    expectFactory.defaultMatchers = defaultMatchers;

    return expectFactory;
});