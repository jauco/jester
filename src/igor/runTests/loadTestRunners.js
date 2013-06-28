---
description: load the testrunners as defined in the config
dependencies:
    map: tools/map
    path: tools/node-wrappers/path

    rsvp: tools/rsvp
    mkdirP: tools/mkdirP

    Saucesession: selenium/Sauce/Saucesession
    LocalSeleniumsession: selenium/Local/LocalSeleniumsession

    SeleniumRunner: tess/runners/Selenium/SeleniumRunner
    NodeRunner: tess/runners/Node/NodeRunner
---
---
---
function loadTestRunners(writeLog, testSystem, webserver, seleniumServer, runners, saucelabsUrl, saucelabsUser, saucelabsKey, outputDirectory) {
    var seleniumRunners = {};
    webserver.addMatch(["requestData", "sendResults"], "/runner/{*}/...", function gets(runnerId, restMatch, query, requestData, sendResults) {
        seleniumRunners[runnerId].handle(this.request, this.response, {sendResults: sendResults, requestData: requestData}, restMatch);
    });
    webserver.addMatch(["requestData", "sendResults"], "/runner/{*}/... (POST)", function posts(runnerId, restMatch, query, requestData, sendResults) {
        seleniumRunners[runnerId].handle(this.request, this.response, {sendResults: sendResults, requestData: requestData}, restMatch);
    });

    function launchSeleniumRunner(index, sessionMaker) {
        var prefix = "/runner/" + index;
        seleniumRunners[index] = new SeleniumRunner(sessionMaker(), "http://" + webserver.hostname + ":" + webserver.port + prefix);
        testSystem.addRunner(seleniumRunners[index]);
    }
    map(runners, function (runner, index) {
        switch (runner.type) {
        case 'phantomjs':
            //not implemented yet
            break;
        case 'sauce':
            launchSeleniumRunner(index, function () { return new Saucesession(saucelabsUrl, saucelabsUser, saucelabsKey, runner.parameters.browserType, runner.parameters.keepAlive); });
            break;
        case 'selenium':
            seleniumServer.then(function (server) {
                launchSeleniumRunner(index, function () { return new LocalSeleniumsession(server.serverUrl, runner.parameters.browserType); });
            });
            break;
        case 'node':
            var tmpDir = path.join(outputDirectory, "runnerTmp", index + "");
            mkdirP(tmpDir, function (err) {
                if (!err) {
                    testSystem.addRunner(new NodeRunner(runner.parameters, tmpDir));
                } else {
                    writeLog(0, "Couldn't launch node runner, because the directory that will hold the node scripts couldn't be created");
                    writeLog(1, err+"");
                }
            });
            break;
        case 'rhino':
            //not implemented yet
            break;
        default:
            writeLog(0, "Could not launch runner of type: '" + runner.type + "'");
        }
    });
}
return loadTestRunners;