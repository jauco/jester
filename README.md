#Jester

>Get your project tested and out there with minimal fuss.

[Jester](https://www.npmjs.org/package/jester-tester) is a cross-platform javascript testing tool which uses the [karma test runner][] for running unittests written with [jasmine][] on multiple browsers. Furthermore, jester will:

* compile your sources and dependencies using [webpack][] so that you can easily include other people's libraries using [commonJS modules][] and [npm][]
* check your source with [eslint][] to warn you of common bugs
* generate documentation from source code and comments with [jsdoc](http://usejsdoc.org/)

The goal of Jester is to give you a bootstrap for integrating these tools so you can worry about your app code and not about the tooling. It can run in batch mode or it can watch your source directories for changes and rerun tests immediately when you update your sources.

## Installation

 1. Install [node.js](http://nodejs.org/download/)
 2. Create a directory for your app `mkdir myApp; cd myApp`
 3. Add a basic machine readable description of your app `npm init`
 4. Install jester from npm and save it into the development dependencies. Under windows you'll have to run this as administrator (required by jsdoc for creating symlinks): 
    `npm install --save-dev jester-tester`

## Creating a project

Initialize your project. This will create the required folders and
a `jester.json` configuration file with default values for your project:

    ./node_modules/.bin/jester-init

This will create the following directories:

    ./src/features/       # the actual top level code that does stuff
    ./src/lib/            # supporting functionality
    ./build/artifacts/    # folder where your compiled application will be stored by jester
    ./build/karma/        # folder from which karma will run the unittests
    ./doc/api/            # jsdoc api documentation
    ./eslint-rules        # custom rules for javascript code quality analysis/

And the following files:

    ./jester.json    # configuration for jester
    ./jsdoc.conf     # configuration for jsdoc, see: http://usejsdoc.org/about-configuring-jsdoc.html
    ./readme.md      # the readme is in markdown and will be included in the jsdoc output

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

## Generating documentation from source

Documentation will be generated from appropriately annotated sources by jsdoc and includes the syntax highlighted source code. See [usejsdoc](http://usejsdoc.org/) for how to annotate your code, especially relevant is [Document CommonJS Modules](http://usejsdoc.org/howto-commonjs-modules.html). 

There are many ways to export and document code. The recommended way to export functions is:

    /**  
     * Deep clone an object
     *
     * @param {Object} obj - the object to clone
     * @returns {Object} a deep clone of the original object 
     * @see {@link http://stackoverflow.com/questions/728360/most-elegant-way-to-clone-a-javascript-object}
     */
	function clone(obj) {
        ...
	}

    module.exports = clone;

This enables jsdoc to recognize that clone is a (static) function, the clone symbol will show up in stack traces and is fully supported by IE8.

The api documentation will be written to a directory specified by the `apiDocPath` setting in `jester.json`, which defaults to `./doc/api/`. You can set the configuration option `readme` to point to a file that is a markdown formatted readme which will be included in the generated documentation on the homepage. 

The api documentation will be generated when you run `jester-batch` or `jester-doc`. The latter is a bit faster because it *only* runs jsdoc. The documentation is *not* automatically updated when running `jester-watch`. 

An additional benefit of annotating your code with jsdoc style comments is that there are a number of tools such as ide's and compilers which can take advantages of the additional information contained in those comments.