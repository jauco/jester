---
description: detect if the debugger statement is used in the code
---
---
---
function debugRequested(code) {
    return code.indexOf("debug" + "ger;") > -1; //fixme: parse the code and detect actual debug statement
}
return debugRequested;