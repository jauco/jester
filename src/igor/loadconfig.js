---
expects:
    console: http://developer.mozilla.org/en-US/docs/DOM/console.log

dependencies:
    fs: tools/node-wrappers/fs
    path: tools/node-wrappers/path
    map: tools/map

    test: richard/test
---
test(__module.AMDid, function (it) {
    function createDependencyStructure() {
        var structure = {
            fs: {
                readFileSync: function (file, encoding) {
                    return structure.data;
                },
                existsSync: function () {
                    return true;
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
                sep: "\\",
                join: path.join
            },
            data: '{"includes": {"includeA":"./foo", "source":"../bar" }, "output": "baz", "saucelabs": {"username": "", "key": ""} }'
        };
        structure.loadConfig = __module.constructor(structure.fs, structure.path, map);
        return structure;
    }
    it("turns 'includes', 'source' and 'output' into absolute paths", function (expect) {
        var structure = createDependencyStructure();
        var config = structure.loadConfig("C:\\Code\\myproject\\jester_config.json", "c:\\app\\path\\");
        expect(config.includes.includeA).toEqual("C:\\Code\\myproject\\foo\\");
        expect(config.includes.source).toEqual("C:\\Code\\bar\\");
        expect(config.output).toEqual("C:\\Code\\myproject\\baz\\");
        //console.log(config.selenium);
        expect(config.selenium.binaries.seleniumServer).toEqual("c:\\app\\path\\selenium-server-standalone-2.35.0.jar");
    });
});
---
---
//max complexity higher because it's a flat if statement list for providing default values
/* jshint maxcomplexity: 20 */

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
        config.runners = map(config.runners, function (data) {
            return { type: data[0], parameters: data[1] }; 
        });
    } else {
        config.runners = [];
    }
    function setDefault(/*"the", "prop", "path", val*/) {
        var i, 
            currentKey = config,
            lastProperty = arguments[arguments.length - 2],
            val = arguments[arguments.length - 1];
        for (i = 0; i < arguments.length - 2; i += 1) {
            if (!currentKey[arguments[i]]) {
                currentKey[arguments[i]] = {};
                currentKey = currentKey[arguments[i]];
            } else {
                currentKey = currentKey[arguments[i]];
            }
        }
        if (!currentKey[lastProperty]) {
            currentKey[lastProperty] = val;
        }
    }

    setDefault("lintpreferences", {});
    setDefault("webserverport", 8081);
    setDefault("graphicDebuggerport", 8080);
    setDefault("selenium","port", 8082);
    setDefault("selenium","binaries","seleniumServer", path.join(appPath, "selenium-server-standalone-2.35.0.jar"));
    setDefault("selenium","binaries","chromedriver", path.join(appPath, "chromedriver2.2.exe"));
    setDefault("selenium","binaries","iedriver", path.join(appPath, "IEDriver_x64_2.35.2.exe"));
    setDefault("saucelabs","url", "http://localhost:4445/wd/hub");
    if (errors.length > 0) {
        throw new Error(errors.join("\n"));
    }
    return config;
}
return loadConfig;