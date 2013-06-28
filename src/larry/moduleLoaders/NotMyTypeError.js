---
description: typed exception to indicate that the loader will not load this type of file.
---
---
---
function NotMyTypeError() {
}

NotMyTypeError.toString = function () {
    return "NotMyTypeError";
};

return NotMyTypeError;