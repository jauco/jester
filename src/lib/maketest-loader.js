"use strict";
function runTest(file) {
  return 'require("' + file + '");';
}

module.exports = function(source) {
  var list = JSON.parse(source);

  return list.map(runTest).join("");
};
