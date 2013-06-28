---
description:
    splits a line into pieces seperated by spaces. pieces "enclosed in quotes" will be counted as one piece
dependencies:
    test: richard/test
---
test(__module.AMDid, function (it, spec) {
    function parseTest(input, result) {
        it("'" + input + "'", function (expect) {
            var splitLine = __module.constructor();

            var tokens = splitLine(input);
            expect(tokens).toEqual(result);
        });
    }
    parseTest('a b', ["a", "b"]);
    parseTest('a b ', ["a", "b"]);
    parseTest('a b "c"', ["a", "b", '"c"']);
    parseTest('a b "c"', ["a", "b", '"c"']);
    parseTest('a b "c d" e', ["a", "b", '"c d"', "e"]);
});
---
---
function splitLine(text) {
    var splitRegex = /"[^"]*"|[^ ]+/g;
    var start = 0; 
    var chunk;
    var tokens = [];
    while ((chunk = splitRegex.exec(text)) != null){ 
        tokens.push(text.substr(start, splitRegex.lastIndex - start).trim());
        start = splitRegex.lastIndex;
    }
    return tokens;
}

return splitLine;