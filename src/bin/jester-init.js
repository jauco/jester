#!/usr/bin/env node

var fs = require('fs'),
    p = require("path");

var FEATURES_PATH = "features/"

var defaultConf = {
    eslintRulesDir: "./eslint-rules/",
    srcPath: "./src/",
    apiDocPath: "./doc/api/",
    jsdocConf: "./jsdoc.conf",
    readme: "./readme.md",
    entryGlob: FEATURES_PATH + "*/feature.js",
    karmaOptions: {
        basePath: "./build/karma/",
        frameworks: ["jasmine"],
        files: ["*.js"],
        reporters: ["dots"],
        browsers: ['Chrome', 'Firefox', 'IE', 'PhantomJS']
    },
    webPackOptions: {
        shared: {},
        entrypoints: {
            output: {
                path: "./build/artifacts"
            }
        },
        testfiles: {
            output: {
                path: "./build/karma/"
            }
        }
    },
    eslintRules: {
        "no-cond-assign": 2, //disallow assignment in conditional expressions
        "no-console": 1, //disallow use of console
        "no-comma-dangle": 2, //disallow trailing commas in object literals
        "no-control-regex": 2, //disallow control characters in regular expressions
        "no-debugger": 1, //disallow use of debugger
        "no-dupe-keys": 2, //disallow duplicate keys when creating object literals
        "no-empty": 2, //disallow empty statements
        "no-empty-class": 2, //disallow the use of empty character classes in regular expressions
        "no-ex-assign": 2, //disallow assigning to the exception in a catch block
        "no-extra-boolean-cast": 2, //disallow double-negation boolean casts in a boolean context
        "no-extra-parens": 1, //disallow unnecessary parentheses
        "no-extra-semi": 2, //disallow unnecessary semicolons
        "no-func-assign": 2, //disallow overwriting functions written as function declarations
        "no-invalid-regexp": 2, //disallow invalid regular expression strings in the RegExp constructor
        "no-negated-in-lhs": 2, //disallow negation of the left operand of an in expression
        "no-obj-calls": 2, //disallow the use of object properties of the global object (Math and JSON) as functions
        "no-regex-spaces": 2, //disallow multiple spaces in a regular expression literal
        "no-spare-arrays": 0, //disallow sparse arrays
        "no-unreachable": 2, //disallow unreachable statements after a return, throw, continue, or break statement
        "use-isnan": 2, //disallow comparisons with the value NaN
        "valid-jsdoc": 1, //Ensure JSDoc comments are valid (off by default)

        //These are rules designed to prevent you from making mistakes. They either prescribe a better way of doing something or help you avoid footguns.
        "block-scoped-var": 0, //treat var statements as if they were block scoped
        "complexity": [2, 20], //specify the maximum cyclomatic complexity allowed in a program
        "consistent-return": 2, //require return statements to either always or never specify values
        "curly": [2, "all"], //specify curly brace conventions for all control statements
        "dot-notation": 0, //encourages use of dot notation whenever possible
        "eqeqeq": 2, //require the use of === and !==
        "guard-for-in": 2, //make sure for-in loops have an if statement (off by default)
        "no-alert": 1, //disallow the use of alert, confirm, and prompt
        "no-caller": 2, //disallow use of arguments.caller or arguments.callee
        "no-div-regex": 2, //disallow division operators explicitly at beginning of regular expression
        "no-else-return": 0, //disallow else after a return in an if.
        "no-empty-label": 2, //disallow use of labels for anything other then loops and switches
        "no-eq-null": 2, //disallow comparisons to null without a type-checking operator
        "no-eval": 2, //disallow use of eval()
        "no-extend-native": 2, //disallow adding to native types
        "no-fallthrough": 2, //disallow fallthrough of case statements
        "no-floating-decimal": 2, //disallow the use of leading or trailing decimal points in numeric literals
        "no-implied-eval": 2, //disallow use of eval()-like methods
        "no-labels": 2, //disallow use of labeled statements
        "no-iterator": 2, //disallow usage of __iterator__ property
        "no-lone-blocks": 2, //disallow unnecessary nested blocks
        "no-loop-func": 2, //disallow creation of functions within loops
        "no-multi-str": 0, //disallow use of multiline strings (the browser test will catch this if necessary)
        "no-native-reassign": 2, //disallow reassignments of native objects
        "no-new": 2, //disallow use of new operator when not part of the assignment or comparison
        "no-new-func": 2, //disallow use of new operator for Function object
        "no-new-wrappers": 2, //disallows creating new instances of String,Number, and Boolean
        "no-octal": 2, //disallow use of octal literals
        "no-octal-escape": 2, //disallow use of octal escape sequences in string literals, such as var foo = "Copyright \251"; use unicode
        "no-proto": 2, //disallow usage of __proto__ property
        "no-redeclare": 2, //disallow declaring the same variable more then once
        "no-return-assign": 2, //disallow use of assignment in return statement
        "no-script-url": 2, //disallow use of javascript: urls.
        "no-self-compare": 2, //disallow comparisons where both sides are exactly the same
        "no-unused-expressions": 2, //disallow usage of expressions in statement position
        "no-with": 2, //disallow use of the with statement
        "no-yoda": 2, //disallow Yoda conditions
        "radix": 2, //require use of the second argument for parseInt()
        "wrap-iife": 2, //require immediate function invocation to be wrapped in parentheses

        //These rules relate to using strict mode.
        //strict mode is enforced externally.
        "no-global-strict": 0, //disallow the "use strict" pragma in the global scope
        "no-extract-strict": 0, //disallow unnecessary use of "use strict"; when already in strict mode
        "strict": 0, //require that all functions are run in strict mode

        //These rules have to do with variable declarations.
        "no-catch-shadow": 2, //disallow the catch clause parameter name being the same as a variable in the outer scope
        "no-delete-var": 2, //disallow deletion of variables
        "no-label-var": 2, //disallow labels that share a name with a variable
        "no-shadow": 2, //disallow declaration of variables already declared in the outer scope
        "no-shadow-restricted-names": 2, //disallow shadowing of names such as arguments
        "no-undef": 2, //disallow use of undeclared variables unless mentioned in a /*global */ block
        "no-undef-init": 2, //disallow use of undefined when initializing variables (stylistic yes, but good to be consequent)
        "no-unused-vars": 0, //disallow declaration of variables that are not used in the code
        "no-use-before-define": 2, //disallow use of variables before they are defined

        //These rules are specific to JavaScript running on Node.js.
        "no-mixed-requires": 0, //disallow mixing regular variable and require declarations
        "no-path-concat": 2, //disallow string concatenation with __dirname and __filename
        "no-process-exit": 2, //disallow process.exit()
        "no-sync": 1, //disallow use of synchronous methods (off by default)

        //These rules are purely matters of style and are quite subjective.
        "brace-style": 2, //enforce one true brace style
        "camelcase": 2, //require camel case names
        "consistent-this": [2, "self"], //enforces consistent naming when capturing the current execution context (off by default)
        "func-names": 0, //require function expressions to have a name
        "func-style": [2, "declaration"], //enforces use of function declarations or expressions
        "new-cap": 2, //require a capital letter for constructors
        "new-parens": 2, //disallow the omission of parentheses when invoking a contructor with no arguments
        "no-nested-ternary": 2, //disallow nested ternary expressions
        "no-array-constructor": 2, //disallow use of the Array constructor
        "no-new-object": 2, //disallow use of the Object constructor
        "no-spaced-func": 2, //disallow space between function identifier and application
        "no-ternary": 0, //disallow the use of ternary operators
        "no-underscore-dangle": 0, //disallow dangling underscores in identifiers
        "no-wrap-func": 2, //disallow wrapping of none IIFE statements in parents
        "quotes": [1, "double", "avoid-escape"], //specify whether double or single quotes should be used
        "quote-props": 0, //require quotes around object literal property names
        "semi": 2, //require use of semicolons instead of relying on ASI
        "sort-vars": 0, //sort variables within the same declaration block
        "space-infix-ops": 2, //require spaces around operators
        "space-return-throw-case": 2, //require a space after return, throw, and case
        "space-unary-word-ops": 2, //require a space around word operators such as typeof
        "max-nested-callbacks": [1, 5], //specify the maximum depth callbacks can be nested
        "one-var": 0, //allow just one var statement per function
        "wrap-regex": 0, //require regex literals to be wrapped in parentheses

        //The following rules are included for compatibility with JSHint and JSLint. While the names of the rules may not match up with the JSHint/JSLint counterpart, the functionality is the same.
        "max-depth": 0, //specify the maximum depth that blocks can be nested (off by default)
        "max-len": 0, //specify the maximum length of a line in your program (off by default)
        "max-params": 0, //limits the number of parameters that can be used in the function declaration. (off by default)
        "max-statements": 0, //specify the maximum number of statement allowed in a function (off by default)
        "no-bitwise": 1, //disallow use of bitwise operators (off by default)
        "no-plusplus": 0 //disallow use of unary operators, ++ and -- (off by default)
    }
};

var defaultJSDocConf = {
    "plugins": [ "plugins/markdown" ],
    "tags": {
        "allowUnknownTags": true
    },
    "source": {
        "includePattern": ".+\\.js(doc)?$",
        "excludePattern": "(^|\\/|\\\\)_"
    },
    "templates": {
        "cleverLinks": false,
        "monospaceLinks": false,
        "default": {
            "outputSourceFiles": true
        }
    }
}

var defaultReadme = "# README \n\
  \n\
  * Replace this readme with useful info about your app \n\
  * [Start writing features](https://github.com/jauco/jester/blob/master/README.md#writing-features-with-jester) \n\
  * Write unittests with [jasmine](http://jasmine.github.io/2.0/introduction.html) \n\
  * Document your project with [jsdoc](http://usejsdoc.org/)";

var defaulKarmaConfig = 
"module.exports = function (config) {\n\
    config.set(require('jester-tester').loadKarmaConfig());\n\
}";
var defaulWebpackConfig = "module.exports = require('jester-tester').loadWebpackConfig()";

var mkdirp = require('mkdirp');
mkdirp(p.resolve(defaultConf.karmaPath));
mkdirp(p.join(defaultConf.srcPath, FEATURES_PATH));
mkdirp(p.join(defaultConf.srcPath, 'lib'));
mkdirp(p.join(defaultConf.srcPath, 'app', 'domain'));
mkdirp(p.resolve(defaultConf.artifactPath));

mkdirp(p.resolve(defaultConf.apiDocPath));
mkdirp(p.resolve(defaultConf.eslintRulesDir));

function writeFileIfNotExists(path, contents) {
    if(fs.existsSync(path)) {
        console.log("file exists, skipped " + path);
    } else {
        console.log("writing new file: " + path);
        fs.writeFileSync(path, contents);
    }
}

writeFileIfNotExists("./jester.json", JSON.stringify(defaultConf, null, 4));
writeFileIfNotExists(defaultConf.jsdocConf, JSON.stringify(defaultJSDocConf, null, 4));
writeFileIfNotExists(defaultConf.readme, defaultReadme);