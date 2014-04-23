module.exports = function handleWebpackResult(stats) {
        if (stats) {
            stats = stats.toJson();
        }
        var nonFatalErrors = (stats && stats.errors) || [];
        var warnings = (stats && stats.warnings) || [];
        
        if (nonFatalErrors.length > 0 || warnings.length > 0) {
            console.error("Something went wrong while generating the test file");

            var byLine = function(str, cb) {
                str.split("\n").forEach(cb);
            }

            var logLines = function (errors) {
                errors.byLine(function (err) {
                    console.log("    ", err); 
                })
            };
            
            if (nonFatalErrors.length > 0) {
                console.log("Non-fatal error" + (nonFatalErrors.length > 1 ? "s" : "") + ":");
                nonFatalErrors.forEach(logLines); 
            }
            
            if (warnings.length > 0) {
                console.log("Warning" + (nonFatalErrors.length > 1 ? "s" : "") + ":");
                warnings.forEach(logLines); 
            }
            
            console.error("Building finished, but the result might not work!");
            
        } 
        else {
            console.log("Building succeeded!");
        }
    };
};