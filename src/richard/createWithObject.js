---
---
---
---
function createWithObject(initializer) {
    function withObject(func1, func2) {
        var setup, run;
        if (!func2) {
            setup = function () {};
            run = func1;
        } else {
            setup = func1;
            run = func2;
        }
        var structure = initializer();
        setup(structure);
        run(structure.create(), structure);
    }
    return withObject;
}
return createWithObject;