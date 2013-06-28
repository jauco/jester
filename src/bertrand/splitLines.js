---
description:
    parses the contract and returns a object that has messages and calls it wishes to make
dependencies:
    test: richard/test
    createSpy: richard/createSpy
    any: richard/any
---
test(__module.AMDid, function (it, spec) {
    function createDependencyStructure() {
        var structure = {
            init: function() {
                return __module.constructor();
            }
        };
        return structure;
    }
    function parseTest(input, checks) {
        it(JSON.stringify(input), function (expect) {
            var deps = createDependencyStructure(),
                splitLines = deps.init();

            var result = splitLines(input);
            checks(result, expect);
        });
    }
    parseTest('a', function (result, expect) {
        expect(result).toEqual(["a"]);
    });
    parseTest('a\n', function (result, expect) {
        expect(result).toEqual(["a"]);
    });
    parseTest('a\nb', function (result, expect) {
        expect(result).toEqual(["a", "b"]);
    });
    parseTest('a\rb', function (result, expect) {
        expect(result).toEqual(["a", "b"]);
    });
    parseTest('a\r\nb', function (result, expect) {
        expect(result).toEqual(["a", "b"]);
    });
    parseTest('a\n\nb', function (result, expect) {
        expect(result).toEqual(["a", "b"]);
    });
    parseTest('\n\na\n\nb', function (result, expect) {
        expect(result).toEqual(["a", "b"]);
    });
    parseTest('   \n\na\n   \nb', function (result, expect) {
        expect(result).toEqual(["a", "b"]);
    });
});
---
---
function splitLines(text) {
    var i,
        curLine = "",
        lines = [];
    for (i = 0; i < text.length; i += 1){
        if (text[i] === "\n" || text[i] === "\r") {
            if (curLine.trim().length > 0) {
                lines.push(curLine);
            }
            curLine = "";
        } else {
            curLine += text[i];
        }
    }
    if (curLine.trim().length > 0) {
        lines.push(curLine);
    }
    return lines;
}
return splitLines;