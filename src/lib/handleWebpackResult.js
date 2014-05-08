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
        };

        var logErrorsByLine = function (errors) {
            errors.byLine(function (err) {
                console.log("    ", err); 
            })
        };

        var pluralizeIf = function(noun, count) {
            return count > 1 ? noun + "s" : noun;
        };

        if (nonFatalErrors.length > 0) {
            console.log(pluralizeIf("Non-fatal error", nonFatalErrors.length) + ":");
            nonFatalErrors.forEach(logErrorsByLine);
        }
        
        if (warnings.length > 0) {
            console.log(pluralizeIf("Warning", nonFatalErrors.length) + ":");
            warnings.forEach(logErrorsByLine);
        }
        
        console.error("Building finished, but the result might not work!");
    } else {
        console.log("Building succeeded!");
    }

};
