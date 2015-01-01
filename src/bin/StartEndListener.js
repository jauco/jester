"use strict";
//var webpack = require("webpack");
var pubsub = require("pubsub");

function diffModules(oldModules, newModules) {
    var tracker = {};
    var changes = {added: [], removed: []};
    newModules.forEach(function (m) {
        if (!oldModules[m.identifier]) {
            changes.added.push(m.identifier);
        }
        tracker[m.identifier] = true;
        oldModules[m.identifier] = true;
    });
    for (var i in oldModules) {
        if (tracker[i] === undefined) {
            //Used to be here but wasn't encountered in the new stats, in other words it was removed
            changes.removed.push(i);
            delete oldModules[i];
        }
    }
    return changes;
}

/**
 * A wrapper around the webpack compiler that adds the following convenience methods
 *
 *  - It emits an event when a recompile starts and ends
 *  - The event receives an object with the modules that were added or removed since the last build
 */
function StartEndlistener(compiler) {
    var self = this;
    self.event = pubsub();
    self.running = false;
    var runsScheduled = 0;
    self.failed = false;
    self.modules = {};

    compiler.plugin("invalid", function () {
        //step 1: file changed, recompile will start shortly. make sure this event only triggers once
        if (self.running === false) {
            self.running = true;
            self.event.publish();
        }
    });
    compiler.plugin("compile", function () {
        runsScheduled += 1;
        //step 2: we actually start compiling
        if (self.running === false) {
            self.running = true;
            self.event.publish();
        }
    });
    function done(success, resultHandler) {
        return function (statsOrErr) {
            runsScheduled -= 1;
            //a file change may have been found while the compiler was running
            //so let the process continue, let it pick up the file change and
            //afterwards detect if all builds are truly finished
            process.nextTick(function () {
                if (runsScheduled === 0) {
                    //step 3a: we're done successfully
                    self.failed = !success;
                    self.running = false;
                    var result = resultHandler(statsOrErr);
                    self.event.publish(result);
                }
            });
        };
    }
    compiler.plugin("done", done(true, function (stats) {
        stats = stats.toJson({modules: true});
        return diffModules(self.modules, stats.modules);
    }));
    compiler.plugin("failed", done(false, function (err) {
        return {added: [], removed: [], error: err};
    }));
}
module.exports = StartEndlistener;
