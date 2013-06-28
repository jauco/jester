---
description:
    parses the contract and returns a object that has messages and calls it wishes to make
expects:
    console: http://developer.mozilla.org/en-US/docs/DOM/console.log
dependencies:
    parseMessage: ./parseMessage
    parseContractDeclaration: ./parseContractDeclaration
    parseAssertionLine: ./parseAssertionLine

    makeBlocks: ./makeBlocks
    splitLines: ./splitLines

    objLoop: tools/objLoop
    map: tools/map

    createSpy: richard/createSpy
    test: richard/test
    any: richard/any
---
test(__module.AMDid, function (it, spec) {
    function createDependencyStructure() {
        var structure = {
            parseContractDeclaration: createSpy(function parseContractDeclaration(line, id, handlers) { return ""; }),
            parseAssertionLine: createSpy("parseAssertionLine"),
            makeBlocks: createSpy(function makeBlocks(input){ return [input]; }),
            splitLines: createSpy(function splitLines(input){ return input; }),
            init: function() {
                return __module.constructor(
                    function () {}, 
                    structure.parseContractDeclaration,
                    structure.parseAssertionLine,
                    structure.makeBlocks,
                    structure.splitLines,
                    objLoop,
                    map);
            }
        };
        return structure;
    }
    it("iterates over snapshot and calls the contractparser on all contracts", function (expect) {
        var deps = createDependencyStructure(),
            main = deps.init();

        main({mod1: {contractText: "<contractText1>", dependencies: [], dependencyVariables: []}, mod2: {contractText: "<contractText2>", dependencies: [], dependencyVariables: []}});
        expect(deps.parseContractDeclaration).toHaveBeenCalledWithTheSequence(
            ["<contractText1>", "mod1", any(Object)],
            ["<contractText2>", "mod2", any(Object)]
        );
    });
    it("adds a hashmap from variable name to AMDid", function (expect) {
        var deps = createDependencyStructure(),
            main = deps.init();

        main({mod1: {contractText: "<contractText1>", dependencies: ["an/id"], dependencyVariables: ["id"]}});
        var handlers = deps.parseContractDeclaration.calls[0].arg["handlers"];
        handlers.assertionLine("", "", []);
        expect(deps.parseAssertionLine).toHaveBeenCalledWith(any(String), any(String), any(Array), {"id": "\"an/id\""});
    });
    it("calls the parser with text split into lines and blocks", function (expect) {
        var deps = createDependencyStructure(),
            main = deps.init();

        main({mod1: {contractText: "<contractText1>", dependencies: [], dependencyVariables: []}});
        expect(deps.makeBlocks).toHaveBeenCalledWith("<contractText1>");
        expect(deps.splitLines).toHaveBeenCalledWith("<contractText1>");
    });

});
---
---
/*jshint -W061 */ //eval is needed here
function parseContract(lines, id, variableToAMDidMapping) {
    var handlers = {
        contract: function(lines) { 
            return parseContractDeclaration(lines, undefined, handlers);
        },
        message: function (prefix, contractName, lines) {
            return parseMessage(prefix, contractName, lines, handlers);
        },
        assertionLine: function (prefix, messageId, line, messageArguments) {
            var mapping = {};
            objLoop(variableToAMDidMapping, function (key, value) {
                mapping[key] = value;
            });
            objLoop(messageArguments, function (key, value) {
                mapping[key] = value;
            });
            return parseAssertionLine(prefix, messageId, line, mapping);
        }
    };
    return parseContractDeclaration(lines, id, handlers);
}

function parse(snapshot) {
    var parsedText = "";
    objLoop(snapshot, function (key, value) {
        var variableToAMDidMapping = {};
        map(value.dependencyVariables, function (dep, i) {
            variableToAMDidMapping[dep] = JSON.stringify(value.dependencies[i]);
        });
        var blocks = makeBlocks(splitLines(value.contractText));
        map(blocks, function (block) {
            parsedText += parseContract(block, key, variableToAMDidMapping);
        });
    });
    //console.log(parsedText);
    return eval("var contractLines = {};\n" + parsedText + ";\ncontractLines;\n");
}

return parse;