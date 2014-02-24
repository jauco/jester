/*globals console, setTimeout*/
module.exports = function withPermutations(specFunc, cb) {
    var permutators = [];
    var curPermutatorPtr;
    var curPermutatingPermutator;
    function permutate() {
        var result;
        if (permutators[curPermutatorPtr] === undefined) {
            permutators[curPermutatorPtr] = {cur: 0, max: arguments.length};
            curPermutatingPermutator = curPermutatorPtr;
        } else if (curPermutatorPtr === curPermutatingPermutator) {
            permutators[curPermutatorPtr].cur += 1;
        }
        result = arguments[permutators[curPermutatorPtr].cur];
        curPermutatorPtr += 1;
        return result;
    }
    if (specFunc.length < 2) {
        do {
            curPermutatorPtr = 0;
            specFunc(permutate);
            while (permutators.length > 0 && permutators[curPermutatingPermutator].max - 1 === permutators[curPermutatingPermutator].cur) {
                curPermutatingPermutator -= 1;
                permutators.pop();
            }
        } while (permutators.length > 0)
    } else {
        //blegh, async
        triggerspecFunc();
    }
    function triggerspecFunc() {
        curPermutatorPtr = 0;
        specFunc(permutate, function () {
            while (permutators.length > 0 && permutators[curPermutatingPermutator].max - 1 === permutators[curPermutatingPermutator].cur) {
                curPermutatingPermutator -= 1;
                permutators.pop();
            }
            if (permutators.length > 0) {
                setTimeout(triggerspecFunc, 0);
            } else {
                cb();
            }
        });
    }
};