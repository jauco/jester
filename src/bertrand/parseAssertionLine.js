---
description:
    parses the contract and returns a object that has messages and calls it wishes to make
expects:
    console: http://developer.mozilla.org/en-US/docs/DOM/console.log
dependencies:
    map: tools/map
    split: ./splitLine
    createSpy: richard/createSpy
    test: richard/test
    any: richard/any
    template: richard/template
---
/*jshint -W061 */ //eval is needed here
test(__module.AMDid, function (it, spec) {
    function createDependencyStructure() {
        var structure = {
            parseMessage: createSpy("parseMessage"),
            init: function() {
                return __module.constructor(map, split);
            }
        };
        return structure;
    }

    function parseTest(input, checks) {
        it("'" + input + "'", function (expect) {
            var deps = createDependencyStructure(),
                parseAssertionLine = deps.init();

            var resultCode = parseAssertionLine("prefix::", '"messageId"::', input);
            var result = eval("var contractLines = {};\n" + resultCode + "; contractLines;");
            checks(result, expect);
        });
    }
    parseTest('var <- "msg"', function (result, expect) {
        expect(result).toEqual(template({
            "prefix::\"messageId\"::var": {
                checks: [
                    {message: '"msg"'}
                ]
            }
        }));
    });
    parseTest('var <- "msg" a', function (result, expect) {
        expect(result).toEqual(template({
            "prefix::\"messageId\"::var": {
                checks: [
                    {message: '"msg"', parameters: ["\"prefix::\\\"messageId\\\"::a\""]}
                ]
            },
            "prefix::\"messageId\"::a": {}
        }));
    });
    parseTest('var <- "msg" a b', function (result, expect) {
        // {
        //     "var": {
        //         checks: [
        //             {message: '"msg"', parameters: ["a", "b"]}
        //         ]
        //     }
        // }
        expect(result["prefix::\"messageId\"::var"].checks[0].parameters).toEqual(["\"prefix::\\\"messageId\\\"::a\"", "\"prefix::\\\"messageId\\\"::b\""]);
        expect(result).toHave("prefix::\"messageId\"::a");
        expect(result).toHave("prefix::\"messageId\"::b");
    });
    parseTest('var <- "msg with spaces (and other [things])" a b', function (result, expect) {
        // {
        //     "var": {
        //         checks: [
        //             {message: '"msg with spaces (and other [things])"', parameters: ["a", "b"]}
        //         ]
        //     }
        // }
        expect(result["prefix::\"messageId\"::var"].checks[0].parameters).toEqual(["\"prefix::\\\"messageId\\\"::a\"", "\"prefix::\\\"messageId\\\"::b\""]);
        expect(result["prefix::\"messageId\"::var"].checks[0].message).toEqual('"msg with spaces (and other [things])"');
    });
    parseTest('var <- "msg" <- "msg2"', function (result, expect) {
        // {
        //     "var": {
        //         checks: [
        //             {message: '"msg"', sendResultTo: <some random variable name>}
        //         ]
        //     },
        //     <the same random variable name>: {
        //         checks: [
        //             {message: '"msg2"'}
        //         ]
        //     }
        // }
        var hiddenIntermediateVariable = result["prefix::\"messageId\"::var"].checks[0].sendResultTo;
        expect(result[eval(hiddenIntermediateVariable)].checks[0].message).toEqual('"msg2"');
    });
    parseTest('var <- "msg" as myVarname <- "msg2"', function (result, expect) {
        // {
        //     "var": {
        //         checks: [
        //             {message: '"msg"', sendResultTo: "prefix::myVarname"}
        //         ]
        //     },
        //     "prefix::myVarname": {
        //         checks: [
        //             {message: '"msg2"'}
        //         ]
        //     }
        // }
        expect(result["prefix::\"messageId\"::var"].checks[0].sendResultTo).toEqual("\"prefix::\\\"messageId\\\"::myVarname\"");
        
        expect(result["prefix::\"messageId\"::myVarname"].checks[0].message).toEqual('"msg2"');
    });
    parseTest('var as myVarname', function (result, expect) {
        expect(result).toEqual(template({
            "prefix::\"messageId\"::myVarname": {
                values: [result["prefix::\"messageId\"::var"]]
            }
        }));
    });
    it("doesn't overwrite previously declared variables", function (expect) {
        var resultCode,
            deps = createDependencyStructure(),
            parseAssertionLine = deps.init();

        resultCode = parseAssertionLine("prefix::", '"messageId"::', 'myVar <- "msg"') +
            parseAssertionLine("prefix::", '"messageId"::', 'myVar <- "other msg"');
        var result = eval("var contractLines = {};\n" + resultCode + "; contractLines;");
        expect(result["prefix::\"messageId\"::myVar"].checks.map(function (check) { return check.message; })).toEqual(['"msg"', '"other msg"']);
    });
    it("can get variables injected from outside", function (expect) {
        var resultCode,
            deps = createDependencyStructure(),
            parseAssertionLine = deps.init();

        resultCode = parseAssertionLine("prefix::", '"messageId"::', 'myVar <- "msg" external', {external: "\"my::external::var\""});
        var result = eval("var contractLines = {};\n" + resultCode + "; contractLines;");
        expect(result["prefix::\"messageId\"::myVar"].checks[0].parameters).toEqual(['"my::external::var"']);
    });
    it("EDGE CASE: also works for the first variable in the line", function (expect) {
        var resultCode,
            deps = createDependencyStructure(),
            parseAssertionLine = deps.init();

        resultCode = parseAssertionLine("prefix::", '"messageId"::', 'myVar <- "msg"', {myVar: "\"my::external::var\""});
        var result = eval("var contractLines = {};\n" + resultCode + "; contractLines;");
        expect(result).toEqual(template({
            "my::external::var": {
                checks: [
                    {message: '"msg"'}
                ]
            }
        }));
    });
});
---
---
var id = 0;
function generateVarName() {
    return " var" + (id++);
}

function varNameToId(varname, prefix, messageId, variableToId) {
    if (variableToId && variableToId.hasOwnProperty(varname)) {
        varname = variableToId[varname];
    } else {
        varname = JSON.stringify(prefix + messageId + varname);
    }
    return varname;
}

function parseAssertionLineSegment(prefix, messageId, tokens, variableToId) {
    var valueTest = {
        message: tokens.shift(),
        parameters: [], 
        sendResultTo: JSON.stringify(prefix + messageId + generateVarName())
    };
    while (tokens[0] && tokens[0] !== "<-") {
        var token = tokens.shift();
        if (token === "as") {
            token = tokens.shift();
            valueTest.sendResultTo = varNameToId(token, prefix, messageId, variableToId);
            //fixme: add errors when 'as foo' is followed by more arguments
        } else {
            token = varNameToId(token, prefix, messageId, variableToId);
            valueTest.parameters.push(token);
        }
    }

    return valueTest;
}

function parseAssertionLine(prefix, messageId, line, variableToId) {
    /* jshint -W083 */ //the function doesn't enclose variables
    var tokens = split(line);
    var valueTest;
    var curVariable = varNameToId(tokens.shift(), prefix, messageId, variableToId);
    var prevLength = 0;
    var result = 
        "if (!contractLines.hasOwnProperty(" + curVariable + ")) {\n" +
        "    contractLines[" + curVariable + "] = {\n" +
        "        name: " + curVariable + ",\n" +
        "        checks: [],\n" + 
        "        values: []\n" + 
        "    };\n" +
        "}\n";
    if (tokens[0] === 'as') {
        result += 
        "if (!contractLines.hasOwnProperty(" + varNameToId(tokens[1], prefix, messageId, variableToId) + ")) {\n" +
        "    contractLines[" + varNameToId(tokens[1], prefix, messageId, variableToId) + "] = {\n" +
        "        name: " + varNameToId(tokens[1], prefix, messageId, variableToId) + ",\n" +
        "        checks: [],\n" + 
        "        values: []\n" + 
        "    };\n" +
        "}\n" +
        "contractLines[" + varNameToId(tokens[1], prefix, messageId, variableToId) + "].values.push(contractLines[" + curVariable + "]);\n";
        tokens.shift();
        tokens.shift();
    }
    while (tokens.length !== prevLength) {
        prevLength = tokens.length;
        var token = tokens.shift();
        if (token === '<-') {
            valueTest = parseAssertionLineSegment(prefix, messageId, tokens, variableToId);
            var usedVariables = valueTest.parameters.concat([valueTest.sendResultTo]);
            result += map(usedVariables, function (variable) {
                return "if (!contractLines.hasOwnProperty(" + variable + ")) {\n" +
                "    contractLines[" + variable + "] = {\n" +
                "        name: " + variable + ",\n" +
                "        checks: [],\n" + 
                "        values: []\n" + 
                "    };\n" +
                "}";
            }).join("\n") + "\n";
            result += "contractLines[" + curVariable + "].checks.push(" + JSON.stringify(valueTest) + ");\n";
            curVariable = valueTest.sendResultTo;
        }
    }
    return result;
}

return parseAssertionLine;