define([], function () {
    function Result(message, passed) {
        this.message = message;
        this.passed = passed;
    }

    Result.prototype.report = function (hideSuccessfulMessages) {
        var result = {
            failedCount: 0,
            passedCount: 0,
            messages: []
        };
        if (this.passed) {
            result.passedCount = 1;
            if (!hideSuccessfulMessages && typeof this.message === 'string' && this.message.trim().length > 0) {
                result.messages.push("[x] " + this.message);
            }
        } else {
            result.failedCount = 1;
            if (typeof this.message === 'string' && this.message.trim().length > 0) {
                result.messages.push("[-] " + this.message);
            }
        }
        return result;
    };

    return Result;
});