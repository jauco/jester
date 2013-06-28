---
expects:
    _uglify: https://github.com/mishoo/UglifyJS
    require: http://nodejs.org/api/modules.html
dependencies:
    getAmdIdFromPath: ../tools/getAmdIdFromPath
    resolveRelativeAMDid: ../tools/resolveRelativeAMDid
    EmptyModule: ../EmptyModule
---
---
---
var uglify = require("uglify-js"),
    NOT_AN_AMD_MODULE = "no define() method found";
function unwrapValue(ast) {
    //in the ast a string is ["string", "value"] and an array is ["array", []] etc.
    return ast[1];
}
function grabDefineCallArgumentsAst(ast) {
    var i,
        statement,
        error;
    //We're looking for the dependency array in the code:
    //    define([ "depA", "depB" ], function(a, b) {
    //this translates to the AST: (we're looking for the part marked with a #)
    //    ['toplevel', [ ['stat', ['call', ['name', 'define'], #[ /*arguments...*/ ]]] ] ]
    if (ast[0] !== 'toplevel') {
        debugger ;
    }
    ast = ast[1];
    for (i = 0; i < ast.length; i += 1) {
        statement = ast[i];
        if (statement[0] === 'stat') { //I'm not completely sure when a statment is wrapped in a stat
            statement = statement[1];
        }
        if (statement[0] === 'call' && statement[1][1] === 'define') {
            return statement[2];
        }
    }
}

function unwrapDependencyArray(dependencyParameterAst) {
    return unwrapValue(dependencyParameterAst).map(unwrapValue);
}

function tryExtractAmdId(argumentAst) {
    var result;
    if (argumentAst.length > 0 && argumentAst[0][0] === 'string') {
        result = unwrapValue(argumentAst[0]);
        argumentAst.shift();
    }
    return result;
}
function tryExtractArray(argumentAst) {
    var result = [];
    if (argumentAst.length > 0 && argumentAst[0][0] === 'array') {
        result = unwrapDependencyArray(argumentAst[0]);
        argumentAst.shift();
    }
    return result;
}
function tryExtractFunction(argumentAst) {
    var result;
    if (argumentAst.length > 0) {
        return argumentAst.shift();
    }
    return result;
}

function extractFunctionBody(functionAst) {
    return uglify.uglify.gen_code(['toplevel', functionAst[3]], {beautify:true});
}

function extractFunctionArguments(functionAst) {
    return functionAst[2];
}

function parseDefineCall(code) {
    var result = {},
        ast = uglify.parser.parse(code),
        argumentAst = grabDefineCallArgumentsAst(ast),
        defineFunction,
        testFunction;
    if (!argumentAst) {
        throw new Error(NOT_AN_AMD_MODULE);
    }
    result.AMDid = tryExtractAmdId(argumentAst);
    result.dependencies = tryExtractArray(argumentAst);
    result.dependencyVariables = [];
    defineFunction = tryExtractFunction(argumentAst);
    if (defineFunction) {
        result.defineFunctionBody = extractFunctionBody(defineFunction);
        result.dependencyVariables = extractFunctionArguments(defineFunction);
    }
    return result;
}


function AMDModule(baseDir, filePath, namespace, jsCode) {
    var defineCallArguments, self;
    if (filePath.substr(-3) !== ".js") {
        throw new Error(NOT_AN_AMD_MODULE);
    }
    self = this;
    self.init(baseDir, filePath, namespace);

    defineCallArguments = parseDefineCall(jsCode);
    if (defineCallArguments.AMDid) {
        self.AMDid = namespace + "/" + defineCallArguments.AMDid;
    }

    self.dependencies = defineCallArguments.dependencies.map(function (dep) { return resolveRelativeAMDid(self.AMDid, dep); });
    self.dependencyVariables = defineCallArguments.dependencyVariables;
    if (defineCallArguments.defineFunctionBody) {
        self.defineFunctionBody = defineCallArguments.defineFunctionBody;
    }
    if (defineCallArguments.testFunctionBody) {
        self.testFunctionBody = defineCallArguments.testFunctionBody;
    }
}

AMDModule.prototype = EmptyModule.prototype;

AMDModule.prototype.addNamespace = function (key) {
    if (key !== "") {
        this.AMDid = key + "/" + this.AMDid;
        this.dependencies = this.dependencies.map(function (id) { return key + "/" + id; });
        this.testDependencies = this.testDependencies.map(function (id) { return key + "/" + id; });
    }
};

function loadModule(baseDir, filePath, namespace, contents, callback) {
    var loadedModule, error;
    try {
        loadedModule = new AMDModule(baseDir, filePath, namespace, contents);
    } catch (e) {
        error = e;
    }
    //not inside the try block so an error in the callback won't trigger the catch
    callback(error, loadedModule);
}

return loadModule;