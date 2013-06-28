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
                makeBlocks = deps.init();

            var result = makeBlocks(input);
            checks(result, expect);
        });
    }
    parseTest(['a', 'b'], function (result, expect) {
        expect(result).toEqual([
            "a", 
            "b"
        ]);
    });
    parseTest(['a', '  b'], function (result, expect) {
        expect(result).toEqual([
            [
                "a",
                "  b"
            ]
        ]);
    });
    parseTest(['a', '  b', '  c'], function (result, expect) {
        expect(result).toEqual([
            [
                "a", 
                "  b", 
                "  c"
            ]
        ]);
    });
    parseTest(['a', 'b', '  c'], function (result, expect) {
        expect(result).toEqual([
            "a",
            [
                "b",
                "  c"
            ]
        ]);
    });
    parseTest(['a', '  b', '    c'], function (result, expect) {
        expect(result).toEqual([
            [
                "a", 
                [
                    "  b", 
                    "    c"
                ]
            ]
        ]);
    });
    parseTest(['a', '  b', 'c'], function (result, expect) {
        expect(result).toEqual([
            [
                "a", 
                "  b"
            ], 
            "c"
        ]);
    });
});
---
---
function makeBlocks(lines) {
    var i,
        line,
        result = [],
        curBlock = result,
        stack = {0: curBlock};
    var indentlevel = 0,
        prevIndentlevel = 0;
    function getIndentlevel(str) {
        return str.length - str.trimLeft().length;
    }
    for (i = 0; i < lines.length; i += 1) {
        line = lines[i];
        prevIndentlevel = indentlevel;
        indentlevel = getIndentlevel(line);
        if (lines.length > i + 1) {
            if (getIndentlevel(lines[i + 1]) > indentlevel) {
                var newResult = [];
                curBlock.push(newResult);
                curBlock = newResult;
                stack[getIndentlevel(lines[i + 1])] = newResult;
            }
        }
        if (getIndentlevel(lines[i]) < prevIndentlevel) {
            curBlock = stack[getIndentlevel(lines[i])];
        }
        curBlock.push(line);
    }
    return result;
}
return makeBlocks;