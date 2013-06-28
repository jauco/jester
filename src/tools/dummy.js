---
dependencies:
    test: richard/test
---
test(__module.AMDid, function (it) {
    it("is awesome", function(expect) {
        expect(2).toBe(2);
    });
});
---
---
function foo() {
    return 2;
}