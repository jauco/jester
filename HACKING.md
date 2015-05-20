# How to debug jester

You attach a graphical debugger ([Node Inspector]) to jester.

- Install [Node Inspector] somewhere. Doesn't matter where.

        $ npm install node-inspector

- Start jester in debug mode.

        $ node-debug node_modules/jester-tester/src/bin/jester-watch.js
        debugger listening on port 5858

- Node Inspector opens http://127.0.0.1:8080/debug?ws=127.0.0.1:8080&port=5858 in a browser.
- Place your breakpoints and press the play button to start running jester.

[Node Inspector]: https://npmjs.org/package/node-inspector

# Suppressing webpack errors/warnings

Webpack can return three kinds of alerts (http://webpack.github.io/docs/node.js-api.html#error-handling):

- Fatal errors - webpack was not able to build.
- Soft errors - webpack was able to build, but it'll probably break if you try to run it.
- Warnings - webpack was able to build and it'll probably work, but there are some code paths that break.

Some soft errors / warnings are false positives,
in the sense that the scenario in which these cause a failure is guaranteed never to occur in practice.

You can tell jester to suppress these false positives by adding the following to your `jester.json`.

```json
{
    ...
    "webpackAlertFilters": [
        {
            "severity": "softError" or "warning",
            "name": "ModuleNotFoundError",
            "justification": "Suppressing this alert is a good idea because ...",
            "origin/rawRequest": "imports?process=>undefined!when",
            "dependencies/0/request": "vertx"
        },
        {
            "severity": "softError" or "warning",
            "name": "CriticalDependenciesWarning",
            "justification": "Suppressing this alert is a good idea because ...",
            "origin/rawRequest": "localforage",
            "origin/blocks/0/expr/type": "CallExpression"
        }
    ]
}
```

Sadly, figuring out exactly which values to configure is not easy:
they're not visible in jester's console output.
To get a hold of them, [debug jester](#how-to-debug-jester) and place a breakpoint in `src/lib/handleWebpackResult.js`.
Then build some code that triggers the alert that you wish to suppress.
This will hit the breakpoint.
Inspect the contents of `stats.compilation.errors` and/or `stats.compilation.warnings`
to see which values you should add to your configuration.
