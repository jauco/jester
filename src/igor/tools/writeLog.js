---
description: write to console.log with the specified indent level
dependencies:
    console: tools/node-wrappers/console
    map: tools/map
    
    test: richard/test
    createSpy: richard/createSpy
---
test(__module.AMDid, function (it) {
    function moduleFactory(console) {
        return {
            console: console || {log: createSpy()},
            createModule: function () {
                return __module.constructor(this.console, map);
            }
        };
    }

    it("calls console.log with the specified indent", function (expect) {
        var factory = moduleFactory();
        var writeLog = factory.createModule();

        writeLog(0, "foo");
        writeLog(1, "foo");
        writeLog(2, "foo");
        expect(factory.console.log).toHaveBeenCalledWithTheSequence(
            ["foo"],
            ["  foo"],
            ["    foo"]
        );
    });
    it("calls console.log with the specified indent for all array members", function (expect) {
        var factory = moduleFactory();
        var writeLog = factory.createModule();

        writeLog(1, ["foo", "bar"]);
        expect(factory.console.log).toHaveBeenCalledWithTheSequence(
            ["  foo"],
            ["  bar"]
        );
    });
    it("calls console.log with the specified indent for all lines in the string", function (expect) {
        var factory = moduleFactory();
        var writeLog = factory.createModule();

        writeLog(1, "foo\nbar");
        expect(factory.console.log).toHaveBeenCalledWithTheSequence(
            ["  foo"],
            ["  bar"]
        );
    });
    it("allows you to set a base indent", function (expect) {
        var factory = moduleFactory();
        var writeLog = factory.createModule();

        var indentedVersion = writeLog.withIndent(1);
        writeLog(1, "foo");
        indentedVersion(1, "bar");
        expect(factory.console.log).toHaveBeenCalledWithTheSequence(
            ["  foo"],
            ["    bar"]
        );
    });
});
---
---
function writeLog(indentLevel, textOrArray) {
    var indent = (new Array(indentLevel+1)).join("  ");
    if (typeof textOrArray === "string") {
        textOrArray = textOrArray.split("\n");
    }
    map(textOrArray, function (text) {
        console.log(indent + text);
    });
}

writeLog.withIndent = function(baseLevel) {
    return function (indentLevel, text) {
        return writeLog(baseLevel + indentLevel, text);
    };
};

return writeLog;