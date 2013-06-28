---
dependencies:
    map: tools/map
    test: richard/test
    createSpy: richard/createSpy
    template: richard/template
---
/*jshint -W061 */ //eval is needed here
test(__module.AMDid, function (it, spec) {
    function createDependencyStructure() {
        var structure = {
            parseMessage: createSpy(function parseMessage(prefix, contractName, lines) { return "contractLines['" + lines[0] + "'] = true;";}),
            handlers: {
                message: function () {
                    return structure.parseMessage.apply(this, arguments);
                }
            },
            init: function() {
                return __module.constructor(map);
            }
        };
        return structure;
    }
    function parseTest(input, checks) {
        it(JSON.stringify(input), function (expect) {
            var deps = createDependencyStructure(),
                contractParser = deps.init();

            var resultCode = contractParser(input, "someAMDid", deps.handlers);
            var result = eval("var contractLines = {};\n" + resultCode + "; contractLines;");
            checks(deps, result, expect);
        });
    }
    parseTest('contract:', function (deps, result, expect) {
        expect(result).toHave("someAMDid(contract)");
        expect(result).toEqual(template({"someAMDid":{values:[result["someAMDid(contract)"]]}}));
    });
    parseTest(['contract:', '    "a message":'], function (deps, result, expect) {
        expect(result).toHave("someAMDid(contract)");
        expect(deps.parseMessage).toHaveBeenCalledWith("someAMDid::", "someAMDid(contract)", ["    \"a message\":"]);
    });
    parseTest(['contract:', '    "a message":', ['    "another message":', '        with content']], function (deps, result, expect) {
        expect(result).toHave("    \"a message\":");
        expect(result).toHave("    \"another message\":");
        expect(deps.parseMessage).toHaveBeenCalledWithTheSequence(
            ["someAMDid::", "someAMDid(contract)", ["    \"a message\":"]],
            ["someAMDid::", "someAMDid(contract)", ["    \"another message\":", '        with content']]
        );
    });
    it(JSON.stringify(['specialName:']), function (expect) {
        var deps = createDependencyStructure(),
            contractParser = deps.init();

        var resultCode = contractParser(['specialName:'], undefined, deps.handlers);
        var result = eval("var contractLines = {};\n" + resultCode + "; contractLines;");
        expect(result).toHave("specialName(contract)");
    });
    it("EDGE CASE: doesn't create the contract when it already exists", function (expect) {
        var deps = createDependencyStructure(),
            contractParser = deps.init();

        var resultCode = contractParser(['specialName:'], undefined, deps.handlers);
        var result = eval("var contractLines = {'specialName':{cookie: true, values:[], checks: []}};\n" + resultCode + "; contractLines;");
        expect(result).toEqual(template({"specialName": {cookie: true}}));
    });

});
---
---
function parseContractDeclaration(block, id, handlers) {
    var firstLine;
    if (typeof block === "string" || block instanceof String) {
        firstLine = block;
        block = [];
    } else {
        firstLine = block.shift();
    }
    if (id === undefined) {
        id = firstLine.substr(0, firstLine.length - 1); //remove : at the end
    }
    var code = "contractLines[" + JSON.stringify(id + "(contract)") + "] = { name: " + JSON.stringify(id) + ", definedMessages: {}};\n" +
        "if (!contractLines.hasOwnProperty(" + JSON.stringify(id) + ")) {\n" + 
        "    contractLines[" + JSON.stringify(id) + "] = {checks: [], values:[]};\n" +
        "}\n" +
        "contractLines[" + JSON.stringify(id) + "].values.push(contractLines[" + JSON.stringify(id + "(contract)") + "]);\n";
    code += map(block, function (line) {
        if (typeof line === "string" || line instanceof String) {
            line = [line];
        }
        return handlers.message(id + "::", id + "(contract)", line);
    }).join("\n");
    return code;
}

return parseContractDeclaration;