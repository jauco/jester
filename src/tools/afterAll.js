---
description: Returns a promise that "blocks" until all provided promises have been resolved.
dependencies:
    map: tools/map
    rsvp: tools/rsvp
---
---
---
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