# How to debug Jester

You attach a graphical debugger ([Node Inspector]) to jester.

- Install [Node Inspector] somewhere. Doesn't matter where.

        $ npm install node-inspector

- Start jester in debug mode.

        $ node-debug node_modules/jester-tester/src/bin/jester-watch.js
        debugger listening on port 5858

- Node Inspector opens http://127.0.0.1:8080/debug?ws=127.0.0.1:8080&port=5858 in a browser.
- Place your breakpoints and press the play button to start running jester.

[Node Inspector]: https://npmjs.org/package/node-inspector
