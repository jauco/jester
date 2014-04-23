#Jester

>Get your project tested and out there with minimal fuss.

[Jester](https://www.npmjs.org/package/jester-tester) is a javascript testing
tool which uses the [karma test runner][] for running unittests written with
[jasmine][] on multiple browsers, [eslint][] for warning you of common bugs and
[webpack][] for compiling your source and dependencies so that you can easily
include other people's libraries using [commonJS modules][] and [npm][]

The idea is to give you a bootstrap for integrating these tools so you can worry
about your app code and not about the tooling.

Jester should run equally well under Windows, Linux and macOS. I'm using the
path.join methods etc. but I haven't done much testing on macOS and Linux so
please report bugs if something doesn't work.

## Installation

 1. Install [node.js](http://nodejs.org/download/)
 2. Create a directory for your app `mkdir myApp; cd myApp`
 4. Add a basic machine readable description of your app `npm init`
 5. Install jester from npm and save it into the development dependencies: 
    `npm install --save-dev jester-tester`

## Creating a project

Initialize your project. This will create the required folders and
a `jester.json` configuration file with default values for your project:

    ./node_modules/.bin/jester-init

This will create the following paths:

    ./src/features/         # the actual top level code that does stuff
    ./src/lib/              # supporting functionality
    ./build/artifacts/      # folder where your compiled application will be stored by jester
    ./build/karma/          # folder from which karma will run the unittests
    ./eslint-rules          # custom rules for javascript code quality analysis

## Writing features with jester
Jester assumes that you build your application from features. Each feature will
be a separate js file that you can load from an html file in the browser by
using `<script src='myscriptsdir/myfeature.js'>`.

Jester packages your features with their dependencies with the help of webpack.
It accomplishes this by searching for a file named `feature.js` in a subfolder
of `src/features/`.

To show how this works we'll create a javascript app which just logs "hello
world" to the console.

The feature is contained in `src/features/greeting/feature.js`:

```javascript
/*globals console*/
// dependencies are imported using commonJS
var hello = require("../../lib/hello");

console.log(hello());
```

The hello function is found in *src/lib/hello.js*:

```javascript
function hello() {
    return "hello world!";
}

module.exports = hello;
```

##Generating the results file

Executing `./node_modules/.bin/jester-batch.js` results in two files.
*greeting.min.js* and *greeting.min.js.map*. The .js file contains the full
javascript code (both feature.js and hello.js). The map is a source map which
maps the source code in the compiled .js file to the original files and lines
for use in the browser debuggers that support this (chrome and firefox atm).

**Note!**: Source maps are not always interpreted and not all browsers support
the same features.

 * You have to enable them manually in chrome (FF has them enabled by default)
 * You won't see the stack traces source mapped in jester's shell output
 * You should see the stack trace source mapped when opening the development
   console in chrome. Firefox doesn't source map stack traces and I haven't
   found a way to enable it.

###warnings
You might notice some warnings in the output. This is eslint telling you that
using console in production code is frowned upon. Some other eslint tests are
configured as errors and jester will flat out refuse to generate the
greeting.min.js file if you forget to put a `var` in front of hello. You can
configure eslint in the file `jester.js`.

You can also create your own project specific custom eslint rules that analyse
the javascript syntax tree. If you place them in eslint-rules eslint will
automatically load them.

###If you think jester-batch is too slow
Jester-batch takes a while to launch and this gets tiresome. So you can also run
jester-*w*atch (`node_modules/.bin/jester-watch.js`) which will keep running and
therefore generate the result files much more quickly.

## Writing a test
Each javascript source file can (and should) have a corresponding file with the
unittests for that piece of code. This file must have the same name of the
tested code, with a `.test.js` suffix.

So let's start with hello world by creating the test file
`./src/lib/hello.test.js`:

```javascript
//Tests are normal js modules, so they load the module under test using commonJS
var hello = require("./hello");

// jasmine is implicitly available in .test.js files
describe("Greetings", function() {
    it("returns `hello tested world`", function() {
        expect(hello()).toBe("hello tested world!");
    });
});
```

This test asserts that the function hello will return the string `hello tested world`.
The test will run upon saving it if jester-watch is running, or else when you 
execute jester-batch.

Jester will now run your tests in the browsers as specified in `jester.js`. Of
course the test will fail because the result of hello is different. Fix the file
hello.js file `src/lib/hello.js` and try running jester-batch again:

```javascript
function hello() {
    return "hello tested world!";
}

module.exports = hello;
```

##Dependency injection
Jester makes it easy to replace a 'require'd module in the source file with a
test-stub. 

Let's say we have a file called src/lib/db.js
```javascript
var retrieveHello = require("db/retrieveHello")
module.exports = function db() {
    return retrieveHello("pgsql://mypgserver")
}
```

and that hello.js uses that:
```javascript
var db = require("./db");
function hello() {
    return db();
}

module.exports = hello;
```
Then you're tests will fail because (a) you're missing the javascript module
that implements retrieveHello and even if you would npm install it, your test
would be dependant on `pgsql://mypgserver`.

Instead your test should inject a shim for db.js

```javascript
/**globals console*/
function dbShim() {
    return "Hello tested and injected world!";
}
var helloMaker = require("jester-tester/src/injectable!./hello");
var hello = helloMaker({"./db": dbShim})

describe("Greetings", function() {
    it("returns `hello world`", function() {
        expect(hello()).toBe("Hello tested and injected world!");
    });
});
```
I encourage you to log the helloMaker function to the console so you can see
what happens under the hood. It's not really magical.

[jester-tester npm]: https://www.npmjs.org/package/jester-tester
[commonJS modules]: http://wiki.commonjs.org/wiki/Modules/1.1
[eslint]: https://github.com/eslint/eslint
[karma test runner]: http://karma-runner.github.io/0.10/index.html
[webpack]: https://github.com/webpack/webpack
[jasmine]: http://jasmine.github.io/2.0/introduction.html
[npm]: https://www.npmjs.org/doc/cli/npm.html

### Todo:
 * source maps end up at the wrong url '.' (setting breakpoints does work though)
 * user interaction and GUI rendering tests through appthwack and Calabash.
 * Allow config options for webpack to be defined
 * Add JSX compiler