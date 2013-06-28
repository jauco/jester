---
expects:
    resultCallback: http://jauco.nl/applications/jester/1/resultCallback
dependencies:
    Spec: ./specs/Spec
---
---
---
/*
FIXME: should callback even if there is an empty spec()
*/
function test(name, specDefinitions) {
    var spec = new Spec(name, specDefinitions);
    spec.execute().then(
        function (result) {
            result = result.report(false);
            resultCallback(result.failedCount === 0, result.messages);
        },
        function (error) {
            resultCallback(false, [error.stack]);
        }
    );
}
return test;