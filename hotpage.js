"use strict";
var status = "not-connected";
module.exports.getStatus = function getStatus() {
    return status;
};
function setStatus(s, reallyConnect) {
    //if status is not-connected, that overrides any other things that might be going on
    if (status === "not-connected" && !reallyConnect) {
        return;
    } else {
        status = s;
    }
}

if (module.hot) {
    var curChange = 0;
    var io = require("socket.io-client/socket.io.js");
    var connection = io.connect();

    connection.on("connect", function () {
        console.log("connect event");
        //show that the connection is up
        setStatus("connected", true);
    });

    connection.on("change-start", function () {
        console.log("change-start event");
        setStatus("pending");
        //put the browser in pending... state
        //keep track of async, so use a counter or something
    });

    connection.on("change-end", function (results) {
        var success = results.success;
        var info = results.info;
        console.log("change-end event", success, info);
        //put the browser in finished state
        if (success) {
            setStatus("checking");
            module.hot.check(true, function(err, updatedModules) {
                setStatus("connected");
                if (err) {
                    if(module.hot.status() in {abort: 1, fail: 1}) {
                        console.warn("[HMR] Cannot apply update. Need to do a full reload!", err.message);
                        window.location.reload();
                    } else {
                        console.error("[HMR] Update failed: ", err);
                    }
                } else {
                    if (!updatedModules || updatedModules.length === 0) {
                        console.log("[HMR] No modules needed updating.");
                    } else {
                        console.groupCollapsed("[HMR] Updated the following modules:");
                        updatedModules.forEach(function(moduleId) {
                            console.log(moduleId);
                        });
                        console.groupEnd();
                    }
                }
            });
        } else {
            setStatus("connected");
        }
    });

    connection.on("disconnect", function() {
        console.log("disconnect event");
        //show that the connection is down
        setStatus("not-connected");
    });
}
