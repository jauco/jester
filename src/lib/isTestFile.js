"use strict";

module.exports = function isTestFile(filename) {
	return (filename.length > 8 && filename.substr(-8) === ".test.js") ||
		(filename.length > 9 && filename.substr(-8) === ".test.jsx") 
}
