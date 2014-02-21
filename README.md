#Jester

>Get your project tested and out there with minimal fuss.

[Jester](https://www.npmjs.org/package/jester-tester) is a javascript 
testing tool which uses [karma](http://karma-runner.github.io/0.10/index.html) for 
running unittests written with [jasmine](http://pivotal.github.io/jasmine/) on multiple clients, 
[eslint code quality checker](https://github.com/eslint/eslint) for code quality control and 
[webpack](https://github.com/webpack/webpack) for compiling your source and dependencies managed 
by [common.js modules](http://wiki.commonjs.org/wiki/Modules/1.1).

## Installation

Install jester from npm with development dependencies:

	npm install --save-dev jester-tester

## Creating a project

Initialize your project. This will create the required folders and
a `jester.json` configuration file with default values for your project:

	./node_modules/.bin/jester-init

This will create the following paths:

    ./src/app/features/     # root folder of your application
    ./build/artifacts/      # folder where your compiled application will be stored by jester
    ./build/karma/          # folder from which karma will run the unittests
    ./eslint-rules          # rules for javascript code quality analysis

## Writing a test

Each javascript source file should have a corresponding file with the unittests for that piece
of code. This file must have the same name of the tested code, with a `.test` suffix.

So let's start with hello world by creating the test file `./src/app/features/hello.test.js`:

```javascript
// jasmine is implicilty available, but every symbol that is used 
// must be declared in the following manner:
/*globals describe, it, expect*/

// dependencies are imported using common.js:
var hello = require("./hello");

// unittests are written with jasmine:
describe("Greetings", function() {
    it("returns `hello world`", function() {
        expect(hello()).toBe("hello world");
    });
});
```

This test asserts that the function hello will return the string `hello world`. To run the rest execute
 `node_modules/jester-tester/bin/jester-batch.js` from the root folder of your application:

This will run eslint on your code and run your tests in the configured browsers. Of course it will 
fail because there isn't any hello function. Create the file `src/app/features/hello.js` and try
running jester-batch again:

```javascript
function hello() {
    return "hello world";
}

module.exports = hello;
```

Now it should succeed. Conveniently, you can run `node_modules/jester-tester/bin/jester-watch.js` instead
while developing to have jester watch for changes in your files and run the appropiate tests on the fly.

## Writing features with jester

Jester packages your features with their dependencies for use in the browser with the help of webpack.
It accomplishes this by searching for a file named *feature.js* in a subfolder of *src/app/features/*. The intent is to
structure your app in modules, where each modules represents a significant feature and corresponds to a subfolder under
the root *src/app/features/*. Each of those module folder must have a file named *feature.js* which is the main entry point
of the feature and it is this file with its dependencies which jester compiles and places in the *build/artifacts* folder.

So to put it all together we'll create a javascript app which just logs "hello world" to the console.

The feature is contained in *src/app/features/greeting/feature.js*:

```javascript
/*globals console*/
var hello = require("./hello");

/*silences the lint rule 'no-console':*/
/*eslint no-console:0*/
console.log(hello());
```

The hello function is found in *src/app/features/greeting/hello.js*:

```javascript
function hello() {
        return "hello world";
}

module.exports = hello;
```

And the unittest for the hello function in *src/app/features/greeting/hello.test.js*:

```javascript
/*globals describe, it, expect*/

var hello = require("./hello");

describe("Greetings", function() {
    it("returns `hello world`", function() {
        expect(hello()).toBe("hello world");
    });
});
```

Running jester-batch.js results in two files. *greeting.min.js* and *greeting.min.js.map*. The
.js file contains the code in feature.js to be linked by your html file. The map is a source map
which maps the source code in the compiled .js file to the original files and lines for use in
the chrome debugger.

## Configuration

TODO

## Links

* [jester-tester npm](https://www.npmjs.org/package/jester-tester)
* [common.js modules](http://wiki.commonjs.org/wiki/Modules/1.1)
* [eslint code quality checker](https://github.com/eslint/eslint)
* [karma test runner](http://karma-runner.github.io/0.10/index.html)
* [webpack](https://github.com/webpack/webpack)
* [jasmine](http://pivotal.github.io/jasmine/)

## Hacking

### How to debug Jester

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

### Todo:
 * source maps end up at the wrong url '.' (setting breakpoints does work though)
 * error stacks aren't sourcemapped by themselves apparently. 
     - https://www.npmjs.org/package/stack-mapper
     - https://github.com/evanw/node-source-map-support
 * user interaction and GUI rendering tests through appthwack and Calabash.
 * rewire support (should be just a plugin away)
 * Allow config options for webpack to be defined
 * Add JSX compiler



