module.exports = function handleWebpackResult(err, stats) {
    if (stats) {
        stats = stats.toJson();
    }
    var nonFatalErrors = (stats && stats.errors) || [];
    var warnings = (stats && stats.warnings) || [];
    if (err || nonFatalErrors.length > 0 || warnings.length > 0) {
        console.error("Something went wrong while generating the test file");
        if (err) {
            console.log("Fatal error:");
            console.log("  ", err);
        }
        if (nonFatalErrors.length > 0) {
            console.log("Non-fatal error" + (nonFatalErrors.length > 1 ? "s" : "") + ":");
            nonFatalErrors.forEach(function (err) {
                err.split("\n").forEach(function (err) {
                    console.log("    ", err); 
                })
            }); 
        }
        if (warnings.length > 0) {
            console.log("Warning" + (nonFatalErrors.length > 1 ? "s" : "") + ":");
            warnings.forEach(function (err) { 
                err.split("\n").forEach(function (err) {
                    console.log("    ", err); 
                })
            }); 
        }
        if (err) {
            console.error("Building failed!");
        } else {
            console.error("Building finished, but the result might not work!");
        }
    } else {
        console.log("Building succeeded!");
    }
};