---
description:
    parses a message section
expects:
    console: http://developer.mozilla.org/en-US/docs/DOM/console.log
dependencies:
    split: ./splitLine
    map: tools/map
    test: richard/test
    createSpy: richard/createSpy
---
/*jshint -W061 */ //eval is needed here
test(__module.AMDid, function (it, spec) {
    function createDependencyStructure() {
        var structure = {
            parseAssertionLine: createSpy("parseAssertionLine", []),
            parseContract: createSpy("parseContract", []),
            init: function() {
                return __module.constructor(split, map);
            }
        };
        return structure;
    }
    function parseTest(input, checks) {
        it("'" + input + "'", function (expect) {
            var deps = createDependencyStructure(),
                parseMessage = deps.init();

            var result = eval(
                "var contractLines = {};\n" + 
                "contractLines['CONTRACTNAME'] = {definedMessages: {}};\n" +
                "contractLines['foo'] = {values: [], checks: []};\n" +
                parseMessage("prefix::", "CONTRACTNAME", input, {"assertionLine": deps.parseAssertionLine, "contract": deps.parseContract}) +
                "contractLines['CONTRACTNAME'].definedMessages['\"msg\"'].test('\"foo\"');\n" +
                "contractLines;\n"
            );
            checks(result, expect, deps);
        });
    }
    parseTest(['"msg":'], function (result, expect) {
        expect(result).toHave('prefix::"msg"::result::1');
    });
    parseTest(['"msg" arg:'], function (result, expect) {
        expect(result).toHave('prefix::"msg"::result::1');
        expect(result).toHave('prefix::"msg"::arg::1');
    });
    parseTest(['"msg" arg another:'], function (result, expect) {
        expect(result).toHave('prefix::"msg"::result::1');
        expect(result).toHave('prefix::"msg"::arg::1');
        expect(result).toHave('prefix::"msg"::another::1');
    });
    parseTest(['"msg":', '   assertionLine'], function (result, expect, deps) {
        expect(deps.parseAssertionLine).toHaveBeenCalledWith("prefix::", '"msg"::','   assertionLine', {result:"\"prefix::\\\"msg\\\"::result::\"+ id"});
    });
    parseTest(['"msg":', '   innerContract:'], function (result, expect, deps) {
        expect(deps.parseContract).toHaveBeenCalledWith('   innerContract:');
    });
    parseTest(['"msg":', ['   innerContract:', '     innerContractLine']], function (result, expect, deps) {
        expect(deps.parseContract).toHaveBeenCalledWith(['   innerContract:', '     innerContractLine']);
    });
    parseTest(['"msg" arg another:'], function (result, expect) {
        expect(result).toHave("contractLines");
        expect(result.contractLines).not.toHave('"msg"');
    });
});
---
---
function parseMessageHeader(prefix, contractName, messageLine) {
    messageLine = messageLine.substr(0, messageLine.length-1); //strip : at the end
    var tokens = split(messageLine);
    var messageId = tokens.shift();
    return {messageId: messageId, parameters: tokens};
}
function parseMessage(prefix, contractName, messageLines, handlers) {
    var code = "";
    var parameterMapping = {};
    var header = parseMessageHeader(prefix, contractName, messageLines[0]);
    code += 
    'contractLines[' + JSON.stringify(contractName) + '].definedMessages[' + JSON.stringify(header.messageId) + '] = { counter:0, test:' +
        'function (' + ["result"].concat(header.parameters).join(",") + ") {\n" +
        '    var id = this.counter += 1;\n';
    map(header.parameters, function(arg) {
        code += '    contractLines[' + JSON.stringify(prefix + header.messageId + "::" + arg + "::") + '+ id] = {name:' + JSON.stringify(prefix + header.messageId + "::" + arg + "::") + '+ id, checks: [], values: [contractLines[eval('+ arg +')]]};\n';
        parameterMapping[arg] = JSON.stringify(prefix + header.messageId + "::" + arg + "::") + '+ id';
    });
    if (header.messageId !== 'side-effects') {
        code += '    contractLines[' + JSON.stringify(prefix + header.messageId + "::result::") + '+ id] = {name:' + JSON.stringify(prefix + header.messageId + "::result::") + '+ id, checks: [], values: []};\n';
        code += '    contractLines[eval(result)].values.push(contractLines[' + JSON.stringify(prefix + header.messageId + "::result::") + '+ id]);\n';
        parameterMapping["result"] = JSON.stringify(prefix + header.messageId + "::result::") + '+ id';
    }
    code += map(messageLines.slice(1), function (block) {
        var firstLine;
        if (typeof block === "string" || block instanceof String) {
            firstLine = block;
        } else {
            firstLine = block[0];
        }
        if (firstLine.substr(-1) === ":") {
            return handlers.contract(block);
        } else {
            return handlers.assertionLine(prefix, header.messageId + "::", block, parameterMapping);
        }
    }).join("\n");
    code += "}\n};\n";
    return code;
}

return parseMessage;