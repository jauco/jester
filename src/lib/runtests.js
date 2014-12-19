"use strict";
var mocha = require("./mocha");
require("./test")(mocha.describe);
require("./test2")(mocha.describe);
mocha.run();

var queued = false;
function querun() {
	if (!queued) {
		window.setTimeout(function () { mocha.run(); queued = false;}, 0);
		queued = true;
	}
}

if (module.hot) {
	module.hot.accept("./test.js", function () {
		require("./test")(mocha.describe);
		querun();
	});
	module.hot.accept("./test2.js", function () {
		require("./test2")(mocha.describe);
		querun();
	});
}
