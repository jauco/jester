/*eslint-env jasmine, browser*/
"use strict";
var withPermutations = require("./withPermutations");

describe("permutator", function () {
    it("creates the permutations of the calls to permutate", function () {
        var results = [];
        withPermutations(function (permutate) {
            results.push([permutate(1, 2), permutate(3, 4)]);
        });
        expect(results).toEqual([[1, 3], [1, 4], [2, 3], [2, 4]]);
    });
    it("Can handle conditionally including more or less permutators", function () {
        var results = [];
        withPermutations(function (p) {
            var x = p(1, 6);
            var y = 0;
            if (x > 2) {
                y = p(3, 4);
            }
            results.push([x, y]);
        });
        expect(results).toEqual([[1, 0], [6, 3], [6, 4]]);
    });
    it("Can handle including different permutators based on logic", function () {
        var results = [];
        withPermutations(function (p) {
            var x = p(1, 6);
            var y;
            if (x < 2) {
                y = p("a", "b");
            } else {
                y = p("c", "d");
            }
            results.push([x, y]);
        });
        expect(results).toEqual([[1, "a"], [1, "b"], [6, "c"], [6, "d"]]);
    });
});

describe("permutator (Edge cases)", function () {
    it("works if you provide only one argument to the last call", function () {
        var results = [];
        withPermutations(function (permutate) {
            results.push([permutate(1, 2), permutate(3)]);
        });
        expect(results).toEqual([[1, 3], [2, 3]]);
    });
    it("works if you provide only one argument to the first call", function () {
        var results = [];
        withPermutations(function (permutate) {
            results.push([permutate(1), permutate(2, 3)]);
        });
        expect(results).toEqual([[1, 2], [1, 3]]);
    });
    it("works if you provide only one argument to both calls", function () {
        var results = [];
        withPermutations(function (permutate) {
            results.push([permutate(1), permutate(3)]);
        });
        expect(results).toEqual([[1, 3]]);
    });
    it("works async", function (testDone) {
        var results = [];
        var curPermutation = 0;
        withPermutations(function (permutate, done) {
            var x = permutate(1, 2);
            setTimeout(function () {
                var y = permutate(3, 4);
                results.push([x, y]);
                curPermutation++;
                done();
            }, 0);
        }, function () {
            expect(results).toEqual([[1, 3], [1, 4], [2, 3], [2, 4]]);
            testDone();
        });
    });
});
