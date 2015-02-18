"use strict";
var fs = require("fs");

function IncludedFilesDumper(path) {
  this.path = path;
}

IncludedFilesDumper.prototype.apply = function (compiler) {
  var self = this;
  compiler.plugin("done", function (stats) {
    var list = stats.compilation.modules.map(function (m) {
      return m.resource;
    }).filter(function (item, idx, arr) {
      return arr.indexOf(item) === idx; //Will fail starting with the second appearance of an item
    });
    console.log(self.path);
    fs.writeFile(self.path, JSON.stringify(list, undefined, 2));
  });
};

module.exports = IncludedFilesDumper;
