---
description: Wrap code in a function so that variables do not leak.
dependencies:
    test: richard/test
    any: richard/any
    createSpy: richard/createSpy
---
/* jshint evil:true */
test(__module.AMDid, function(it, spec) {
    var limitScope = __module.constructor();
    it("provides javascript code that contains 'use strict' so no undefined variables can leak scope.", function (expect) {
        var resultCode = limitScope("someUninitializedValue = 10;");

        expect(new Function(resultCode)).toThrow("someUninitializedValue is not defined");
    });
    
    it("provides javascript code that is placed inside a construct so that top level variables aren't added to global scope", function (expect) {
        var resultCode = limitScope("var someVariableName = 'some value'");

        expect(function () {eval(resultCode + "; someVariableName");}).toThrow("someVariableName is not defined");
    });
});
---
---
// this.contract = runner.contract(this.AMDid, [], {
//     "()": function (jsCode) {
//         jsCode.send("<valid js>");

//         return runner.contract.str.extend("scope safe code", [], {
//             "<valid js>": runner.contract.undef,
//             "<scope safe>": runner.contract.undef
//         });
//     }
// });
function limitScope(jsCode) {
    return "(function() {\n" +
        "\"use strict\";\n" +
        jsCode + "\n" +
        "}());";
}
return limitScope;