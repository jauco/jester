---
dependencies:
    test: richard/test
expects:
    require: http://nodejs.org/api/modules.html
    _reactTools: https://npmjs.org/package/react-tools
---
test(__module.AMDid, function (it) {
    it("works", function (expect) {
        var compileJsx = __module.constructor();
        var code = 
            "/** @jsx React.DOM */\n" +
            "var foo = <a href='foo'>foo</a>;\n";
        var expectedResult = 
            "/** @jsx React.DOM */\n" +
            "var foo = React.DOM.a( {href:\"foo\"}, \"foo\");\n";

        expect(compileJsx(code)).toEqual(expectedResult);
    });
});
---
---
var visitors = require("react-tools/vendor/fbtransform/visitors").transformVisitors;
var transform = require('react-tools/vendor/fbtransform/lib/transform').transform;

return function compileJsx(source) {
    return transform(visitors.react, source).code;
};