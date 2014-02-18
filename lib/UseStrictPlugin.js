/*
    MIT License http://www.opensource.org/licenses/mit-license.php
    Author Tobias Koppers @sokra
*/
var ConcatSource = require("webpack/node_modules/webpack-core/lib/ConcatSource");

function wrapComment(str) {
    if(str.indexOf("\n") < 0) return "/*! " + str + " */";
    return "/*!\n * " + str.split("\n").join("\n * ") + "\n */";
}

function BannerPlugin(banner, options) {
}
module.exports = BannerPlugin;
BannerPlugin.prototype.apply = function(compiler) {
    var banner = this.banner;
    var entryOnly = this.entryOnly;
    compiler.plugin("compilation", function(compilation) {
        compilation.plugin("optimize-chunk-assets", function(chunks, callback) {
            chunks.forEach(function(chunk) {
                if(entryOnly && !chunk.initial) return;
                chunk.files.forEach(function(file) {
                    compilation.assets[file] = new ConcatSource("(function () {\n'use strict';\n", compilation.assets[file], "\n}());");
                });
            });
            callback();
        });
    });
};
