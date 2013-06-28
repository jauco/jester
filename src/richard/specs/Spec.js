define(
    ["tools/afterAll", "../results/NestedResults", "../results/Result", "./It", "tools/map"], 
    function (afterAll, NestedResults, Result, It, map) {
        function Spec(description, specDefinitions) {
            var self = this;

            this.description = description;
            this._queue = [];

            specDefinitions(
                function it(desc, testFunc) {
                    self._queue.push(new It(desc, testFunc));
                },
                function spec(desc, specDefinitions) {
                    self._queue.push(new Spec(desc, specDefinitions));
                }
            );
        }

        Spec.prototype.execute = function () {
            var self = this;
            var promiseQueue;
            var specResults = new NestedResults(self.description);
            function execute(it) {
                return it.execute().then(
                    function (result) {
                        specResults.addResult(result);
                    },
                    function (err) {
                        specResults.addResult(new Result(err.stack, false));
                    }
                );
            }
            map(this._queue, function (it, index) {
                if (promiseQueue) {
                    promiseQueue = promiseQueue.then(function () {
                        return execute(it);
                    }, function () {
                        return execute(it);
                    });
                } else {
                    promiseQueue = execute(it);
                }
            });
            return promiseQueue.then(function () {
                return specResults;
            })
        };

        return Spec;
    }
);