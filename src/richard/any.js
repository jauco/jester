define([], function () {
    function any(expectedClass) {
        var noExpectedClass = arguments.length === 0;
        return {
            jasmineMatches: function (other) {
                if (noExpectedClass) {
                    return true;
                }
                if (expectedClass === String) {
                    return typeof other === 'string' || other instanceof String;
                }

                if (expectedClass === Number) {
                    return typeof other === 'number' || other instanceof Number;
                }

                if (expectedClass === Function) {
                    return typeof other === 'function' || other instanceof Function;
                }

                return other instanceof expectedClass;
            },
            toString: function () {
                return '<any ' + expectedClass.name + '>';
            }
        }
    }
    return any;
});