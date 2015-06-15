"use strict";

var webpack = require("../lib/webpackPromise"),
    handleWebpackResult = require("./handleWebpackResult");

module.exports = function rebuildProject(webpackConfig, webpackWarningFilters) {
        var config = Object.create(webpackConfig);
        return webpack(config)
        .then(function (stats){
            return handleWebpackResult(stats, webpackWarningFilters);
        });
};
