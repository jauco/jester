"use strict";
module.exports = function handleWebpackResult(stats, webpackAlertFilters) {
    if (stats) {
        if (webpackAlertFilters && filterConfigIsValid(webpackAlertFilters)) {
            var softErrorFilters = webpackAlertFilters.filter(function isSoftErrorFilter(filter) {
                return filter.severity === "softError";
            });
            var warningFilters = webpackAlertFilters.filter(function isWarningFilter(filter) {
                return filter.severity === "warning";
            });
            stats.compilation.errors = filterWebpackAlerts(stats.compilation.errors, softErrorFilters);
            stats.compilation.warnings = filterWebpackAlerts(stats.compilation.warnings, warningFilters);
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
                console.log("    ", err);
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

function filterConfigIsSupported(webpackAlertFilter) {
    return "name" in webpackAlertFilter
      && "origin/rawRequest" in webpackAlertFilter
      && "dependencies/0/request" in webpackAlertFilter
      && Object.keys(webpackAlertFilter).length === 3 // That is, webpackAlertFilter contains no keys other than these three.
      && webpackAlertFilter.name === "ModuleNotFoundError";
}

/**
 * Checks the sanity of the webpackAlertFilters-configuration.
 * @param {Array} webpackAlertFilters - the filter configuration.
 * @return {bool} whether it is sane
 */
function filterConfigIsValid(webpackAlertFilters) {
    return true;
    // TODO adjust this
    var result;
    if (Array.isArray(webpackAlertFilters)) {
        result = true;
        for (var i = 0; i < webpackAlertFilters.length; i++) {
            if (!filterConfigIsSupported(webpackAlertFilters[i])) {
                // This filter config isn't supported. Abort.
                console.warn(
                    "config.webpackAlertFilters[" + i + "] must be an object similar to {\n" +
                    "   'name': 'ModuleNotFoundError',\n" +
                    "   'origin/rawRequest': 'imports?process=>undefined!when',\n" +
                    "   'dependencies/0/request': 'vertx'\n" +
                    "}."
                );
                result = false;
            }
        }
    } else {
        console.warn("config.webpackAlertFilters must be an array.");
        result = false;
    }
    return result;
}

function filterWebpackAlerts(unfilteredAlerts, alertFilters) {
    if (!alertFilters) {
        // No filters are configured. Use the complete, unfiltered list of alerts.
        return unfilteredAlerts;
    }

    // There's at least one filter and all filter configs are supported. Do the actual filtering.
    var filteredAlerts = unfilteredAlerts.filter(function isShown(alert) {
        if (alert.name !== "ModuleNotFoundError") {
            // filterWebpackAlerts only supports filtering of ModuleNotFoundError-alerts.
            // This is some other kind of alert. Leave it in the list, so that it IS shown in Jester's output.
            return true;
        }

        for (var i = 0; i < alertFilters.length; i++) {
            var webpackAlertFilter = alertFilters[i];
            if (
                alert.origin.rawRequest === webpackAlertFilter["origin/rawRequest"]
                && alert.dependencies.length > 0
                && alert.dependencies[0].request === webpackAlertFilter["dependencies/0/request"]
            ) {
                // This alert matches one of the filters.
                // Remove it from the list, so that it is NOT shown in Jester's output.
                return false;
            }
        }

        // This alert matches none of the filters.
        // Leave it in the list, so that it IS shown in Jester's output.
        return true;
    });

    return filteredAlerts;
}
