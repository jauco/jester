---
dependencies:
    test: richard/test
---
test(__module.AMDid, function (it) {
    var createRelativeAMDid = __module.constructor();
    function handle(ownId, toId, result) {
        it("handles " + ownId + " -> " + toId, function (expect) {
            expect(createRelativeAMDid(ownId, toId)).toEqual(result);
        });
    }
    handle("a", "b", "./b");
    handle("a", "b/v", "./b/v");
    handle("a/b", "b/v", "../b/v");
    handle("a/b", "a/v", "./v");
});
---
---
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