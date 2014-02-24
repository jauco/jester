/*
    MIT License http://www.opensource.org/licenses/mit-license.php
    Author Tobias Koppers @sokra
*/
var ConcatSource = require("webpack/node_modules/webpack-core/lib/ConcatSource");

function UseStrictPlugin() {
}
module.exports = UseStrictPlugin;
UseStrictPlugin.prototype.apply = function(compiler) {
    compiler.plugin("compilation", function(compilation) {
        compilation.plugin("optimize-chunk-assets", function(chunks, callback) {
            chunks.forEach(function(chunk) {
                chunk.files.forEach(function(file) {
                    compilation.assets[file] = new ConcatSource("(function () {\n'use strict';\n", compilation.assets[file], "\n}());");
                });
            });
            callback();
        });
    });
};