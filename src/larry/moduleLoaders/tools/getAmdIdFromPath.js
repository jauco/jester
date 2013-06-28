---
expect:
    pathlib: http://nodejs.org/api/path.html
---
test(__module.AMDid, function (it) {
    var pathlib,
        getAmdIdFromPath;
    function prepareFake() {
        pathlib = {
            sep: "/",
            extname: function (str) {
                return ".js";
            }
        };
        return getAmdIdFromPath = __module.constructor(pathlib);
    }
    it("will create an amdID relative to the specified directory", function (expect) {
        prepareFake();
        var amdID = getAmdIdFromPath("/some/dir/", "/some/dir/a_js_module.js");
        expect(amdID).toEqual("a_js_module");
    });
    it("will create an amdID relative to the specified directory including subdirectories", function (expect) {
        prepareFake();
        var amdID = getAmdIdFromPath("/some/", "/some/dir/a_js_module.js");
        expect(amdID).toEqual("dir/a_js_module");
    });
    it("can handle both linux paths and windows paths", function (expect) {
        prepareFake();
        var nixAmdID,winAmdID;
        nixAmdID = getAmdIdFromPath("/some/", "/some/dir/a_js_module.js");
        pathlib.sep = "\\";
        winAmdID = getAmdIdFromPath("c:\\some\\", "c:\\some\\dir\\a_js_module.js");
        expect(nixAmdID).toEqual("dir/a_js_module");
        expect(winAmdID).toEqual("dir/a_js_module");
    })
});
---
---
// "()" dirPath, filepath:
//     dirPath <- "<is string>"
//             <- "<absolute path>"
//             <- "<ends with pathsep>"

//     filepath <- "<is string>"
//              <- "<absolute path>"

//     string as returnvalue
function getAmdIdFromPath(dirPath, filepath) {
    var pathlib = require('path');
    //strip base directory, dirPath always ends in / so the new filepath never starts with /
    filepath = filepath.substr(dirPath.length);

    //strip extension
    filepath = filepath.substr(0, filepath.length - pathlib.extname(filepath).length);

    //convert \ or : to / if needed
    filepath = filepath.split(pathlib.sep).join("/");

    return filepath;
}
return getAmdIdFromPath;