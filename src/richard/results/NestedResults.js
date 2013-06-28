define(["tools/map", "tools/reduce"], function (map, reduce) {
    function NestedResults(groupCaption) {
        this._groupCaption = groupCaption;
        this._results = [];
    }
    
    NestedResults.prototype.addResult = function (result) {
        this._results.push(result);
    };

    NestedResults.prototype.addResults = function (results) {
        this._results = this._results.concat(results);
    };

    NestedResults.prototype.report = function(hideSuccessfulMessages) {
        var result;
        
        result = reduce(
            map(this._results, function (result) {
                return result.report(hideSuccessfulMessages);
            }),
            function (obj, newVal) {
                obj.failedCount += newVal.failedCount;
                obj.passedCount += newVal.passedCount;
                obj.messages = obj.messages.concat(map(newVal.messages, function (msg) { return msg.replace(/^/gm, "  "); } ));
                return obj;
            },
            {
                failedCount: 0,
                passedCount: 0,
                messages: [],
            }
        );

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
});