module.exports = function handleWebpackResult(stats, webpackWarningFilters) {
    if (stats) {
        try {
            assertFiltersValid(webpackWarningFilters);
            stats.compilation.warnings = filterWebpackWarnings(stats.compilation.warnings, webpackWarningFilters);
        } catch (error) {
            console.error(error);
        }
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

/**
 * Checks the sanity of the webpackWarningFilters-configuration.
 */
function assertFiltersValid(webpackWarningFilters) {
    if (!webpackWarningFilters) {
        // No filters are configured. That's okay.
        return;
    }
    if (!Array.isArray(webpackWarningFilters)) {
        throw new TypeError("config.webpackWarningFilters must be an array.");
    }
    for (var i = 0; i < webpackWarningFilters.length; i++) {
        var webpackWarningFilter = webpackWarningFilters[i];
        if ("name" in webpackWarningFilter
            && "origin/rawRequest" in webpackWarningFilter
            && "dependencies/0/request" in webpackWarningFilter
            && Object.keys(webpackWarningFilter).length === 3 // That is, webpackWarningFilter contains no keys other than these three.
            && webpackWarningFilter.name === "ModuleNotFoundError"
        ) {
            // This filter config is supported. Proceed.
        } else {
            // This filter config isn't supported. Abort.
            throw new Error(
                "config.webpackWarningFilters[" + i + "] must be an object similar to {\n" +
                "   'name': 'ModuleNotFoundError',\n" +
                "   'origin/rawRequest': 'imports?process=>undefined!when',\n" +
                "   'dependencies/0/request': 'vertx'\n" +
                "}."
            );
        }
    }
}

function filterWebpackWarnings(unfilteredWarnings, webpackWarningFilters) {
    if (!webpackWarningFilters) {
        // No filters are configured. Use the complete, unfiltered list of warnings.
        return unfilteredWarnings;
    }

    // There's at least one filter and all filter configs are supported. Do the actual filtering.
    var filteredWarnings = unfilteredWarnings.filter(function filterWarning(warning, index, unfilteredWarnings) {
        if (warning.name !== "ModuleNotFoundError") {
            // filterWebpackWarnings only supports filtering of ModuleNotFoundError-warnings.
            // This is some other kind of warning. Leave it in the list, so that it IS shown in Jester's output.
            return true;
        }

        for (var i = 0; i < webpackWarningFilters.length; i++) {
            var webpackWarningFilter = webpackWarningFilters[i];
            if (
                warning.origin.rawRequest === webpackWarningFilter["origin/rawRequest"]
                && warning.dependencies.length > 0
                && warning.dependencies[0].request === webpackWarningFilter["dependencies/0/request"]
            ) {
                // This warning matches one of the filters.
                // Remove it from the list, so that it is NOT shown in Jester's output.
                return false;
            }
        }

        // This warning matches none of the filters.
        // Leave it in the list, so that it IS shown in Jester's output.
        return true;
    });

    return filteredWarnings;
}
