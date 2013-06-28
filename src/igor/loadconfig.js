---
expects:
    require: http://nodejs.org/api/modules.html
    _fs: http://nodejs.org/api/fs.html
    _path: http://nodejs.org/api/path.html
dependencies:
    map: tools/map
    test: richard/test
---
var path = require('path');
test(__module.AMDid, function (it) {
    function createDependencyStructure() {
        var structure = {
            fs: {
                readFileSync: function (file, encoding) {
                    return structure.data;
                }
            },
            path: {
                resolve: function () {
                    if (arguments.length === 1 && arguments[0] === "./jester_config.json"){
                        return "C:\\Code\\myproject\\jester_config.json";
                    } else {
                        return path.resolve.apply(path, arguments);
                    }
                },
                dirname: path.dirname,
                sep: "\\"
            },
            data: '{"includes": {"includeA":"./foo"}, "source":"../bar", "output": "baz"}'
        };
        structure.loadConfig = __module.constructor(structure.fs, structure.path);
        return structure;
    }
    it("turns 'includes', 'source' and 'output' into absolute paths", function (expect) {
        var structure = createDependencyStructure();
        var config = structure.loadConfig();
        expect(config.includes.includeA).toEqual("C:\\Code\\myproject\\foo\\");
        expect(config.source).toEqual("C:\\Code\\bar\\");
        expect(config.output).toEqual("C:\\Code\\myproject\\baz\\");
    });
});
---
---
// "()" exceptionHandler:
//     exceptionHandler <- "Error: invalid config"
//     loaded_config as returnvalue

//     loaded_config:
//         ".includes":
//             hashMap<absolutePath> as returnvalue
//         ".source": 
//             absolutePath as returnvalue
//         ".output": 
//             absolutePath as returnvalue
//         ".entrypoints": 
//             array<string> as returnvalue
//         ".testrunner": 
//             string as returnvalue
    
//     absolutePath:
//         string+
//         "<absolute path>":
//         "<ends with pathsep>":

var path = require('path'),
    fs = require('fs');

function dirSpecToPath(baseDir, dirSpec) {
    return path.resolve(baseDir, "./" + dirSpec) + path.sep;
}

function loadConfig(configPath, appPath) {
    var key,
        errors = [],
        paths = [],
        configdir = path.dirname(configPath),
        config = JSON.parse(fs.readFileSync(configPath, "utf8"));

    function test(result, error) {
        if (!result) {
            errors.push(error);
        }
    }
    test(config.hasOwnProperty("output"), "The configuration file is missing the 'output' property.");
    config.output = dirSpecToPath(configdir, config.output);
    test(fs.existsSync(config.output), "The specified output directory does not exist: " + config.output);
    paths.push(config.output);

    test(config.hasOwnProperty("includes"), "The configuration file is missing the 'includes' property.");
    for (key in config.includes) {
        if (config.includes.hasOwnProperty(key)) {
            config.includes[key] = dirSpecToPath(configdir, config.includes[key]);
            test(fs.existsSync(config.includes[key]), "The specified include directory does not exist: " + config.includes[key]);
            paths.push(config.includes[key]);
        }
    }

    //throw error if an include is a subdir of another include or source
    var dirsThatAreSubdirsOfOtherDirs = map(paths, function (subdir) {
        var parentDirs = paths.filter(function (parentDir) { return subdir.indexOf(parentDir) > -1 && subdir !== parentDir; });
        test(parentDirs.length === 0, subdir + "is a subdirectory of: " + parentDirs.join(", "));
    });

    if (config.runners) {
        config.runners = map(config.runners, function (data) { return { type: data[0], parameters: data[1] }; });
    } else {
        config.runners = [];
    }
    if (!config.lintpreferences) {
        config.lintpreferences = {};
    }
    if (!config.webserverport) {
        config.webserverport = 8081;
    }
    if (!config.graphicDebuggerport) {
        config.graphicDebuggerport = 8080;
    }
    if (!config.selenium) {
        config.selenium = {};
    }
    if (!config.selenium.binaries) {
        config.selenium.binaries = {};
    }
    if (!config.selenium.port) {
        config.selenium.port = 8082;
    }
    if (!config.selenium.binaries.seleniumServer) {
        config.selenium.binaries.seleniumServer = path.join(appPath, "selenium-server-standalone-2.19.0.jar");
    }
    if (!config.selenium.binaries.chromedriver) {
        config.selenium.binaries.chromedriver = path.join(appPath, "chromedriver.exe");
    }
    if (!config.selenium.binaries.iedriver) {
        config.selenium.binaries.iedriver = path.join(appPath, "IEDriver_x64_2.33.0.exe");
    }
    if (!config.saucelabs) {
        config.saucelabs = {};
    }
    if (!config.saucelabs.url) {
        config.saucelabs.url = "http://localhost:4445/wd/hub";
    }
    test(config.saucelabs.hasOwnProperty("username"), "You should provide a username for accessing saucelabs.");
    test(config.saucelabs.hasOwnProperty("key"), "You should provide a key for accessing saucelabs (hexadecimal token string).");
    if (errors.length > 0) {
        throw new Error(errors.join("\n"));
    }
    return config;
}
return loadConfig;