---
description: lets you perform an action on a module and its dependant tree
dependencies:
    map: tools/map
---
---
---
function walkDependants(module, snapshot, action, writtenModules, level) {
    if (!writtenModules) {
        writtenModules = {};
    }
    if (!level) {
        level = 0;
    }
    if (! writtenModules.hasOwnProperty(module)) {
        writtenModules[module] = true;
        action(module, snapshot, level);
        map(snapshot[module].dependants, function (dependant) {
            walkDependants(dependant, snapshot, action, writtenModules, level + 1);
        });
    }
}
return walkDependants;