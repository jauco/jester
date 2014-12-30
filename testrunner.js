/* This will be the testrunner.
 *
 * The placeholders will be replaced by the AddTestDependencies plugin.
 *
 */
var placeholderForTheTestframeworkSpecificCode;
var placeholderForRequireCalls;
var placeholderForHotReload;
var testframework = require(placeholderForTheTestframeworkSpecificCode);

if (testframework.initPage) { testframework.initPage(); }

if (testframework.beforeInitialRun)  { testframework.beforeInitialRun(); }
placeholderForRequireCalls();
// require("some_test");
// require("some_other_test");
// ...
if (testframework.afterInitialRun) { testframework.afterInitialRun(); }

if (module.hot) {
    placeholderForHotReload();
    // module.hot.accept("some_test", function () {
    //    testframework.beforeRefresh && testframework.beforeRefresh();
    //    require("some_test");
    //    testframework.afterRefresh && testframework.afterRefresh();
    // });
    // module.hot.accept("some_other_test", function () {
    //   testframework.beforeRefresh && testframework.beforeRefresh();
    //   require("some_other_test");
    //   testframework.afterRefresh && testframework.afterRefresh();
    // });
}
