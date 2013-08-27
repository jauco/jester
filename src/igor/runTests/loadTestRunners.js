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
function loadTestRunners(writeLog, testSystem, webserver, seleniumServer, runners, saucelabsUrl, saucelabsUser, saucelabsKey, outputDirectory, node_exe) {
    var seleniumRunners = {};
    webserver.addMatch(["requestData", "sendResults"], "/runner/{*}/...", function gets(runnerId, restMatch, query, requestData, sendResults) {
        seleniumRunners[runnerId].handle(this.request, this.response, {sendResults: sendResults, requestData: requestData}, restMatch);
    });
    webserver.addMatch(["requestData", "sendResults"], "/runner/{*}/... (POST)", function posts(runnerId, restMatch, query, requestData, sendResults) {
        seleniumRunners[runnerId].handle(this.request, this.response, {sendResults: sendResults, requestData: requestData}, restMatch);
    });

    function launchSeleniumRunner(runner, index, sessionMaker) {
        var prefix = "/runner/" + index;
        seleniumRunners[index] = new SeleniumRunner(sessionMaker(), "http://" + webserver.hostname + ":" + webserver.port + prefix, runner.parameters.scripturls);
        testSystem.addRunner(seleniumRunners[index]);
    }

    map(runners, function (runner, index) {
        var selenium_started = false;
        try {
            switch (runner.type) {
            case 'phantomjs':
                //not implemented yet
                break;
            case 'sauce':
                writeLog(0, "launching sauce runner: " + runner.parameters.browserType);
                if (!runner.parameters.hasOwnProperty("keepAlive")) {
                    writeLog(1, "You should provide a parameter called keepAlive to the sauce configuration to indicate how long to wait before closing the session.");
                }
                else if (!Saucesession.type.hasOwnProperty(runner.parameters.browserType)) {
                    writeLog(1, "You should provide a parameter called browserType to the sauce configuration to indicate what browser to launch. Valid values are: " + Object.keys(Saucesession.type));
                } else {
                    launchSeleniumRunner(runner, index, function () {return new Saucesession(saucelabsUrl, saucelabsUser, saucelabsKey, runner.parameters.browserType, runner.parameters.keepAlive); });
                }
                break;
            case 'selenium':
                seleniumServer.then(function (server) {
                    selenium_started = true;
                    writeLog(0, "launching selenium runner: " + runner.parameters.browserType);
                    if (!LocalSeleniumsession.type.hasOwnProperty(runner.parameters.browserType)) {
                        writeLog(1, "You should provide a parameter called browserType to the sauce configuration to indicate what browser to launch. Valid values are: " + Object.keys(Saucesession.type));
                    } else {
                        launchSeleniumRunner(runner, index, function () { return new LocalSeleniumsession(server.serverUrl, runner.parameters.browserType); });
                    }
                }).fail(function (e) { 
                    if (!selenium_started) {
                        writeLog(0, "selenium server failed to start");
                        writeLog(0, e && e.toString());
                    } else {
                        writeLog(0, "Runner failed to start");
                        writeLog(0, e && e.toString());
                    }
                });
                break;
            case 'node':
                writeLog(0, "launching node runner");
                var tmpDir = path.join(outputDirectory, "runnerTmp", index + "");
                mkdirP(tmpDir, function (err) {
                    if (!err) {
                        testSystem.addRunner(new NodeRunner(runner.parameters, tmpDir, node_exe));
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
        } catch (e) {
            writeLog(0, "asd"); 
            writeLog(0, e.toString());
        }
    });
}
return loadTestRunners;