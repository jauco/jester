---
dependencies:
    objLoop: tools/objLoop
    yamlparser: ./yamlparser
    resolveRelativeAMDid: ../tools/resolveRelativeAMDid
    EmptyModule: ../EmptyModule
    NotMyTypeError: ../NotMyTypeError

    test: richard/test
    createSpy: richard/createSpy
    any: richard/any
    template: richard/template
---
test(__module.AMDid, function (it) {
    function moduleFactory(console) {
        return {
            yamlparser: createSpy(function yamlparser(text) { return {}; }),
            fileContents:
                "---\n" +
                "front-matter\n" +
                "---\n" +
                "tests\n" +
                "---\n" +
                "contracts\n" +
                "---\n" +
                "module code",
            resolveRelativeAMDid: createSpy("resolveRelativeAMDid", function (base, id) { return id; }),
            EmptyModule: EmptyModule,
            createModule: function () {
                return __module.constructor(objLoop, this.yamlparser, this.resolveRelativeAMDid, EmptyModule, NotMyTypeError);
            }
        };
    }

    it("parses a js file with dash-seperated blocks into blocks", function (expect){
        var factory = moduleFactory();
        var loadModule = factory.createModule();
        var callback = createSpy(function (error, result) {});

        loadModule("/adirPath", "/adirPath/aFilePath.js", "namespace", factory.fileContents, callback);

        expect(callback).toHaveBeenCalledWith(undefined, any(Object));
    });

    it("Throws NotMyTypeError for non-js files", function (expect){
        var factory = moduleFactory();
        var loadModule = factory.createModule();
        var callback = createSpy(function (error, result) {});

        loadModule("/adirPath", "/adirPath/aFilePath.exe", "namespace", factory.fileContents, callback);

        expect(callback).toHaveBeenCalledWith(any(NotMyTypeError), undefined);
    });

    it("Throws NotMyTypeError for files without 4 blocks", function (expect){
        var factory = moduleFactory();
        var loadModule = factory.createModule();
        var callback = createSpy(function (error, result) {});

        var fileContents = "module code";

        loadModule("/adirPath", "/adirPath/aFilePath.js", "namespace", fileContents, callback);

        expect(callback).toHaveBeenCalledWith(any(NotMyTypeError), undefined);
    });

    it("parses the front matter as yaml", function (expect){
        var factory = moduleFactory();
        var loadModule = factory.createModule();
        var callback = createSpy(function (error, result) {});

        loadModule("/adirPath", "/adirPath/aFilePath.js", "namespace", factory.fileContents, callback);

        expect(factory.yamlparser).toHaveBeenCalledWith("\nfront-matter\n");
    });

    it("saves 'dependencies' and 'expects' in the resulting object", function (expect){
        var factory = moduleFactory();
        factory.yamlparser = function () { return {expects: {"foo": "bar"}, "dependencies": {"foo": "baz"}}; };
        var loadModule = factory.createModule();
        var callback = createSpy(function (error, result) {});

        loadModule("/adirPath", "/adirPath/aFilePath.js", "namespace", factory.fileContents, callback);
        expect(callback).toHaveBeenCalledWith(undefined, template({expectations: {"foo": {url: "bar"}}, dependencies: ["baz"]}));
    });

    it("rewrites the relative dependencies from the code into absolute IDs", function (expect){
    });

    it("can get a namespace added", function (expect) {
    });

    //encountered bugs

    it("If an exception is thrown in the callback then this code shouldn't handle it", function (expect){
        var factory = moduleFactory();
        var loadModule = factory.createModule();
        var callback = function (error, result) { if (result) { throw new Error(); } };

        expect(function () {
            loadModule("/adirPath", "/adirPath/aFilePath.js", "namespace", "---\n---\n---\n---\n", callback);
        }).toThrow();
    });

});
---
---
function parseFile(code) {
    var result, blocks, header;

    blocks = code.split(/^---$/m);
    if (blocks.length < 5) { //<empty>, header, test, contract, module. Starts with empty because the file starts with ---
        throw new NotMyTypeError();
    }
    header = yamlparser(blocks[1]) || {};

    return {
        expects: header.expects,
        moduleText: blocks[4],
        dependencyIDs: header.dependencies,
        testText: blocks[2],
        contractText: blocks[3]
    };
}

function ContractModule(baseDir, filePath, namespace, jsCode) {
    var dep, file, self;
    if (filePath.substr(-3) !== ".js") {
        throw new NotMyTypeError();
    }    
    self = this;
    self.init(baseDir, filePath, namespace);
    file = parseFile(jsCode);

    if (file.dependencyIDs) {
        for (dep in file.dependencyIDs) {
            if (file.dependencyIDs.hasOwnProperty(dep)) {
                self.dependencies.push(resolveRelativeAMDid(self.AMDid, file.dependencyIDs[dep]));
                self.dependencyVariables.push(dep);
            }
        }
    }
    if (file.expects) {
        self.expectations = objLoop(file.expects, function (key, value, newKey) {
            var optionalIdentifier = "optional ";
            var isOptional = key.substring(0, optionalIdentifier.length) === optionalIdentifier;
            if (isOptional) {
                newKey(key.substring(optionalIdentifier.length));
            }
            return {
                url: value,
                optional: isOptional,
                variable: key.substring(optionalIdentifier.length)
            };
        });
    }
    if (file.contractText) {
        self.contractText = file.contractText;
    }
    if (file.moduleText) {
        self.defineFunctionBody = file.moduleText;
    }
    if (file.testText) {
        self.testFunctionBody = file.testText;
    }
}

ContractModule.prototype = EmptyModule.prototype;

function loadModule(baseDir, filePath, namespace, contents, callback) {
    var loadedModule, error;
    try {
        loadedModule = new ContractModule(baseDir, filePath, namespace, contents);
    } catch (e) {
        error = e;
    }
    callback(error, loadedModule);
}

return loadModule;


// "()" baseDir, filePath, callback:
//     filePath <- "<string>"
//     string as jsCode

//     parseFile <- "()" jsCode, exceptionHandler as parsed

//     parsed <- ".AMDid" as amdId
//     getAmdIdFromPath <- "()" baseDir, filePath as amdId

//     variableName <- "()" amdId <- "<valid variable>"

//     parsed <- ".dependencies" as deps
//     parsed <- ".testDependencies" as testdeps
//     deps <- "for(i)" as depToResolve
//     testdeps <- "for(i)" as depToResolve
//     resolveRelativeAMDid <- "()" amdId, depToResolve

//     parsed <- ".defineFunction" as moduleCode <- "<valid js>"
//     parsed <- ".testFunction"  as testCode <- "<valid js>"

//     callback <- "()" error, AMDModule

//     AMDModule:
//         ".AMDid":
//             amdId as returnvalue
//         ".dependencies":
//             deps as returnvalue
//         ".testDependencies":
//             testdeps as returnvalue
//         ".defineFunctionBody":
//             moduleCode as returnvalue
//         ".testFunctionBody":
//             testCode as returnvalue
//         ".callExecuteCode()":
//             validJsCt:
//                 string+
//                 "<valid js>"
//             validJsCt as returnvalue
//         ".addNamespace()" namespace:
//             namespace <- "<is string>"