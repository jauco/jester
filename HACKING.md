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

# How to update dependencies

We use npm shrinkwrap to pin all dependency versions and their dependencies. This makes jester less fragile, but also slower
to update. To update a package:

 1. remove the npm-shrinkwrap.json
 2. change the version of the package in package.json
 3. run `npm update <package>`
 4. run `npm shrinkwrap`
 5. remove all "resolved" lines (see https://github.com/npm/npm/issues/3581 for an explanation why)
