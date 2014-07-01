# How to debug Jester

You attach a graphical debugger ([node-inspector]) to jester.

- Install [node-inspector] somewhere. Doesn't matter where.

        $ npm install node-inspector

- Start node-inspector.

        $ node_modules/.bin/node-inspector
        Node Inspector v0.7.4
        Visit http://127.0.0.1:8080/debug?port=5858 to start debugging.

  *node-inspector* now waits for the process-to-debug on port 5858, and for you on port 8080.

- Start jester in debug mode.

        $ node --debug-brk node_modules/jester-tester/src/bin/jester-watch.js
        debugger listening on port 5858

- Browse to http://127.0.0.1:8080/debug?port=5858.
- Place your breakpoints and press the play button to start running jester.

[node-inspector]: https://npmjs.org/package/node-inspector
