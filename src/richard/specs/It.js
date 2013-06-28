define(
    ["tools/rsvp", "../expect/expectFactory", "../results/Result", "../results/NestedResults"], 
    function (rsvp, expectFactory, Result, NestedResults) {
        function It(description, func) {
            this.description = description;
            this.func = func;
        };

        It.prototype.execute = function () {
            var results,
                funcResult,
                promise = rsvp.promise();
            if (typeof this.func === "function") {
                try {
                    results = new NestedResults(this.description);
                    funcResult = this.func(expectFactory(results), promise);
                    if (funcResult === promise) { //function indicates that it is async
                        promise = promise.then(function () { return results; });
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
    }
);