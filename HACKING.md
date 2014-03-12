# How to debug Jester

You attach a graphical debugger ([node-inspector]) to the unittests, or to the compiled jester.js

### Attaching the debugger to the compiled jester.js

1. Start node-inspector on port 8080:

        $ cd <jester source dir>
        $ .\dist\node_modules\.bin\node-inspector --web-port=8080
        info  - socket.io started
        visit http://0.0.0.0:8080/debug?port=5858 to start debugging

2. Start jester in debug mode:

        $ .\dist\node.exe --debug-brk .\dist\jester.js
        debugger listening on port 5858

3. Open a browser on http://localhost:8080
4. place your breakpoints and press the play button to start running jester.

### Debug Jester's unittests

1. Run jester:

        .\dist\node.exe .\dist\jester.js

2. Add a breakpoint in a unittest by inserting the string `debugger;` somewhere and save the file.
3. Open a browser on http://localhost:8080
4. Press the play button to start running the unittest

[node-inspector]: https://npmjs.org/package/node-inspector
