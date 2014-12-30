"use strict";
module.exports = {
   beforeInitialRun: function () {console.log("beforeInitialRun");},
   afterInitialRun: function () {console.log("afterInitialRun");},
   beforeRefresh: function () {console.log("beforeRefresh");},
   afterRefresh: function () {console.log("afterRefresh");}
};
