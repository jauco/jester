---
description: Process kickoff, registers listeners and prints results to console.
expects:
    console: http://developer.mozilla.org/en-US/docs/DOM/console.log
    process: http://nodejs.org/api/process.html
    __dirname: http://nodejs.org/api/globals.html
dependencies:
    map: tools/map
    path: tools/node-wrappers/path

    writeLog: ./tools/writeLog

    getModules: larry/main
    TestSystem: tess/main
    Webserver: tools/server
    loadTestRunners: ./runTests/loadTestRunners
    launchSeleniumServer: selenium/Local/LaunchSeleniumServer

    loadconfig: ./loadconfig
    runTest: ./runTests/runTests
    runLint: ./runLint/runLint
    updateArtifacts: ./updateArtifacts/updateArtifacts

    test: richard/test
    any: richard/any
    spy: richard/createSpy
---
---
---
var webserver, seleniumServer, moduleWatcherDisposer;
console.log("Starting jester");
process.on('exit', function() {
    try {
        webserver.dispose();
    } catch (e) {}
    try {
        seleniumServer.valueOf().dispose();
    } catch (e) {}
    try {
        moduleWatcherDisposer();
    } catch (e) {}
});
process.on('SIGINT', function() {//catch ctrl-c and turn it into a clean exit.
    process.exit();
});
var config_location = "./jester_config.json";
if (process.argv[2]) {
    console.log("Using " + process.argv[2] + " as config location.");
    config_location = process.argv[2];
}
//relative to current location of the user
var config = loadconfig(path.resolve("./jester_config.json"), __dirname);

webserver = new Webserver();
webserver.start(config.webserverport);

seleniumServer = launchSeleniumServer(
    config.selenium.port,
    config.selenium.binaries.seleniumServer,
    config.selenium.binaries.chromedriver,
    config.selenium.binaries.iedriver
);

var testSystem = new TestSystem();

//start testrunners based on config
loadTestRunners(
    writeLog,
    testSystem,
    webserver,
    seleniumServer,
    config.runners,
    config.saucelabs.url,
    config.saucelabs.username,
    config.saucelabs.key,
    config.output,
    process.argv[0]
);

moduleWatcherDisposer = getModules(
    config.includes, 
    function onModuleChanged(errors, AMDid, snapshot) {
        if (!errors) {
            writeLog(0, "********************************************************************************");
            writeLog(0, snapshot[AMDid].path + " was updated.");

            var indentedWriter = writeLog.withIndent(1);
            runLint(AMDid, snapshot, config.lintpreferences, indentedWriter)
            .then(function () {
                return runTest(AMDid, snapshot, testSystem, indentedWriter);
            })
            // .always(function () {
            //     return runContracts(snapshot, indentedWriter);
            // })
            .always(function () {
                return updateArtifacts(AMDid, snapshot, config.output, indentedWriter);
            })
            .then(undefined, function (errors) {
                writeLog(0, errors ? errors.toString() : "");
            });
        } else {
            writeLog(0, "Couldn't load '" + snapshot[AMDid].path + "'. ");
            writeLog(0, errors.stack);
        }
    },
    function onModuleDeleted(snapshot) {
        writeLog(0, "delete event");
        // runContracts(snapshot);
    }
);