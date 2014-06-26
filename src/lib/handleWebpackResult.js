module.exports = function handleWebpackResult(stats, webpackWarningFilters) {
    if (stats) {
        stats.compilation.warnings = filterWebpackWarnings(stats.compilation.warnings, webpackWarningFilters);
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
            byLine(errors, function (err) {
                console.log("    ", err, typeof err);
            });
        };

        var pluralizeIf = function(noun, count) {
            return count > 1 ? noun + "s" : noun;
        };

        if (nonFatalErrors.length > 0) {
            console.log(pluralizeIf("Non-fatal error", nonFatalErrors.length) + ":");
            nonFatalErrors.forEach(logErrorsByLine);
        }

        if (warnings.length > 0) {
            console.log(pluralizeIf("Warning", warnings.length) + ":");
            warnings.forEach(logErrorsByLine);
        }

        console.error("Building finished, but the result might not work!");
    } else {
        console.log("Building succeeded!");
    }

};

function filterWebpackWarnings(unfilteredWarnings, webpackWarningFilters) {
    // TODO check sanity of config

    var filteredWarnings = unfilteredWarnings.filter(function filterWarnings(warning, index, unfilteredWarnings) {
        // TODO use webpackWarningFilters

        if (warning.name === "ModuleNotFoundError"
            && warning.origin.rawRequest === "imports?process=>undefined!when"
            && warning.dependencies[0].request === "vertx"
        ) {
            // This warning matches one of the filters.
            // Remove it from the list, so that it is NOT shown in Jester's output.
            return false;
        } else {
            // This warning matches none of the filters.
            // Leave it in the list, so that it IS shown in Jester's output.
            return true;
        }
    });

    return filteredWarnings;
}
