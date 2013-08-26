---
dependencies:
    compileJsx: tools/node-wrappers/compileJsx

    test: richard/test
expects:
    console: http://developer.mozilla.org/en-US/docs/DOM/console.log
---
test(__module.AMDid, function (it) {
    it("jsx compiler integration test", function (expect) {
        var compile = __module.constructor(compileJsx);
        expect(compile("return <foo/>;")).toEqual("return foo(null);");
        expect(compile("return 2;")).toEqual("return 2;");
    });
});
---
---
return function compile(jsCode) {
    var compiledCode;
    //we're going to wrap the code. So add two markers to unwrap it later on:
    //the plusses are to prevent this code from being split in the wrong place
    //try removing them and see what happens :)
    jsCode = "/*__jester" + "__split__*/" + jsCode + "/*__jester" + "__split__*/";

    //esprima requires a full function and throws a syntax error when it 
    //encounters a "return" statement outside of a function
    jsCode = "function temp_wrapper(){" + jsCode + "}";

    //react requires that the module starts with ...@jsx...
    jsCode = "/** @jsx React.DOM */\n" + jsCode;

    compiledCode = compileJsx(jsCode);

    //unwrap it again
    compiledCode = compiledCode.split("/*__jester" + "__split__*/")[1];

    return compiledCode;
};