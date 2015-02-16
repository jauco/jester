"use strict";
module.exports = function handleWebpackResult(stats, webpackWarningFilters) {
    if (stats) {
        if (filterConfigIsValid(webpackWarningFilters)) {
            stats.compilation.warnings = filterWebpackWarnings(stats.compilation.warnings, webpackWarningFilters);
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

function filterConfigIsSupported(webpackWarningFilter) {
    return "name" in webpackWarningFilter
      && "origin/rawRequest" in webpackWarningFilter
      && "dependencies/0/request" in webpackWarningFilter
      && Object.keys(webpackWarningFilter).length === 3 // That is, webpackWarningFilter contains no keys other than these three.
      && webpackWarningFilter.name === "ModuleNotFoundError";
}

/**
 * Checks the sanity of the webpackWarningFilters-configuration.
 * @param {Array} webpackWarningFilters - the filter configuration.
 * @return {bool} whether it is sane
 */
function filterConfigIsValid(webpackWarningFilters) {
    var result = true;
    if (webpackWarningFilters) {
        if (Array.isArray(webpackWarningFilters)) {
            for (var i = 0; i < webpackWarningFilters.length; i++) {
                if (!filterConfigIsSupported(webpackWarningFilters[i])) {
                    // This filter config isn't supported. Abort.
                    console.warn(
                        "config.webpackWarningFilters[" + i + "] must be an object similar to {\n" +
                        "   'name': 'ModuleNotFoundError',\n" +
                        "   'origin/rawRequest': 'imports?process=>undefined!when',\n" +
                        "   'dependencies/0/request': 'vertx'\n" +
                        "}."
                    );
                    result = false;
                }
            }
        } else {
            console.warn("config.webpackWarningFilters must be an array.");
            result = false;
        }
    } else {
        // No filters are configured. That's okay.
        result = true;
    }
    return result;
}

function filterWebpackWarnings(unfilteredWarnings, webpackWarningFilters) {
    if (!webpackWarningFilters) {
        // No filters are configured. Use the complete, unfiltered list of warnings.
        return unfilteredWarnings;
    }

    // There's at least one filter and all filter configs are supported. Do the actual filtering.
    var filteredWarnings = unfilteredWarnings.filter(function filterWarning(warning, index) {
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
