---
dependencies:
    objLoop: tools/objLoop
---
---
---
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