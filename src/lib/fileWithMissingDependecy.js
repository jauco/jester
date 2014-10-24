/*eslint no-console:0*/
try {
    var dep = require("somethingThatDoesntExist");
} catch (e) {}

if (!dep) {
    console.log("mkay...");
}