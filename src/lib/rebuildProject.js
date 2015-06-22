"use strict";

var webpack = require("../lib/webpackPromise"),
    handleWebpackResult = require("./handleWebpackResult");

module.exports = function rebuildProject(webpackConfig, webpackWarningFilters) {
    return webpack(webpackConfig)
        .then(function (stats){
            return handleWebpackResult(stats, webpackWarningFilters);
        });
};
