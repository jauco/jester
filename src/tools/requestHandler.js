---
description:
    This module is able to call the correct function when an url pattern matches. It allows you to build a tree of 
    nested handlers, each responsible for their own part. It guarantees that the urls it generates will route back to
    the requested method.
dependencies:
    objLoop: ./objLoop
    urlTools: tools/node-wrappers/url
    test: richard/test
    createSpy: richard/createSpy
---
test(__module.AMDid, function (it, category) {
    function moduleFactory() {
        return {
            createModule: function () {
                return __module.constructor(objLoop, urlTools);
            }
        };
    }

    category("Call the correct function when an url pattern matches", function (it) {
        it("will call the handler if the url is equal to the one provided", function (expect) {
            var factory = moduleFactory();
            var RequestHandler = factory.createModule();

            var shouldBeCalled = createSpy("");
            var handler = new RequestHandler({
                "/foo/bar": shouldBeCalled
            });

            handler.handle({url: "/foo/bar", method: "GET"});
            expect(shouldBeCalled).toHaveBeenCalled();
        });
        it("Returns 'undefined' when no url matches", function (expect) {
            var factory = moduleFactory();
            var RequestHandler = factory.createModule();

            var shouldBeCalled = createSpy("");
            var handler = new RequestHandler({
                "/foo/bar": shouldBeCalled
            });

            expect(handler.handle({url: "/some/other/url", method: "GET"})).toEqual(undefined);
            expect(shouldBeCalled).not.toHaveBeenCalled();  
        });
        it("will match using wildcards", function (expect) {
            var factory = moduleFactory();
            var RequestHandler = factory.createModule();

            var shouldBeCalled = createSpy("");
            var handler = new RequestHandler({
                "/foo/{*}": shouldBeCalled,
                "/bar/{*}": function someName() {}
            });

            handler.handle({url: "/foo/bar", method: "GET"});
            expect(shouldBeCalled).toHaveBeenCalledWith("bar", {});
            expect(handler.urlFor["someName"]("baz")).toEqual("/bar/baz");
        });
        it("will match the remainder of the url using /...", function (expect) {
            var factory = moduleFactory();
            var RequestHandler = factory.createModule();
            var shouldBeCalled = createSpy("");
            var handler = new RequestHandler({
                "/foo/...": shouldBeCalled
            });
            handler.handle({url: "/foo/bar/baz", method: "GET"});
            expect(shouldBeCalled).toHaveBeenCalledWith({first:"/foo", rest:"/bar/baz"}, {});
        });
        it("also matches the HTTP verb if you provide it in the URL", function (expect) {
            var factory = moduleFactory();
            var RequestHandler = factory.createModule();
            var shouldBeCalled = createSpy("");
            var handler = new RequestHandler({
                "/foo/bar (POST)": shouldBeCalled
            });
            handler.handle({url: "/foo/bar", method: "GET"});
            expect(shouldBeCalled).not.toHaveBeenCalled();
            handler.handle({url: "/foo/bar", method: "POST"});
            expect(shouldBeCalled).toHaveBeenCalled();
        });
    });

    category("Be able to generate urls", function (it) {
        it("can generate an url for a registered handler", function (expect) {
            var factory = moduleFactory();
            var RequestHandler = factory.createModule();

            var handler = new RequestHandler({
                "/foo/bar": function someName() {}
            });

            expect(handler.urlFor["someName"]()).toEqual("/foo/bar");
        });
        it("will generate urls for patterns with {*}", function (expect) {
            var factory = moduleFactory();
            var RequestHandler = factory.createModule();

            var handler = new RequestHandler({
                "/foo/{*}": function foo() {}
            });

            expect(function () { handler.urlFor["foo"](); }).toThrow();
        });
        it("will throw an exception when too few arguments are passed", function (expect) {
            var factory = moduleFactory();
            var RequestHandler = factory.createModule();

            var handler = new RequestHandler({
                "/foo/{*}": function foo() {}
            });

            expect(handler.urlFor["foo"]("bar")).toEqual("/foo/bar");
        });
        it("will generate urls for patterns with /...", function (expect) {
            var factory = moduleFactory();
            var RequestHandler = factory.createModule();

            var handler = new RequestHandler({
                "/foo/...": function foo() {}
            });

            expect(handler.urlFor["foo"]("/bar/baz/jan")).toEqual("/foo/bar/baz/jan");
            expect(function () { handler.urlFor["foo"]("bar/baz/jan"); }).toThrow();
        });
    });

    category("Provide useful information to the handler function", function (it) {
        it("provides the urlFor method", function (expect) {
            var factory = moduleFactory();
            var RequestHandler = factory.createModule();
            var handler = new RequestHandler({
                "/foo": function foo() {
                    //trigger
                    this.urlFor["foo"]();
                }
            });
            handler.urlFor["foo"] = createSpy("urlFor");
            expect(handler.urlFor["foo"]).not.toHaveBeenCalled();
            handler.handle({url: "/foo", method: "GET"});
            expect(handler.urlFor["foo"]).toHaveBeenCalled();
        });
        it("provides node's request", function (expect) {
            var factory = moduleFactory();
            var RequestHandler = factory.createModule();
            var cookie = {url: "/foo", method: "GET"};
            var wasCalled;
            var handler = new RequestHandler({
                "/foo": function foo() {
                    expect(this.request).toBe(cookie);
                    wasCalled = true;
                }
            });
            handler.handle(cookie);
            expect(wasCalled).toBe(true);
        });
        it("provide's the parsed url query part as the last argument", function (expect, promise) {
            var factory = moduleFactory();
            var RequestHandler = factory.createModule();
            var handler = new RequestHandler({
                "/foo": function foo(query) {
                    expect(query).toEqual({foo: "bar"});
                    promise.fulfill();
                }
            });
            handler.handle({url: "/foo?foo=bar", method: "GET"});
            return promise;
        });
    });

    category("Be able to build a tree of requestHandlers", function (it) {
        it("allows you to pass a context object that will be provided to the handler", function (expect, promise) {
            var factory = moduleFactory();
            var RequestHandler = factory.createModule();
            var cookie = {};
            var wasCalled;
            var handler = new RequestHandler(["context"], {
                "/foo": function foo(queryParams, context) {
                    expect(context).toBe(cookie);
                    promise.fulfill();
                }
            });
            handler.handle({url: "/foo", method: "GET"}, undefined, {context: cookie});
            return promise;
        });
        it("returns the handler's returnvalue from the handle call", function (expect) {
            var factory = moduleFactory();
            var RequestHandler = factory.createModule();
            var cookie = {};
            var handler = new RequestHandler({
                "/foo": function foo() {
                    return cookie;
                }
            });
            var result = handler.handle({url: "/foo", method: "GET"});
            expect(result).toBe(cookie);
        });
        it("allows you to override the url that is used for matching", function (expect) {
            var factory = moduleFactory();
            var RequestHandler = factory.createModule();

            var shouldBeCalled = createSpy("");
            var handler = new RequestHandler({
                "/foo/bar": shouldBeCalled
            });

            handler.handle({url: "/Something/that/will/be/ignored", method: "GET"}, undefined, undefined, {rest: "/foo/bar"});
            expect(shouldBeCalled).toHaveBeenCalled();
        });
        //together with the previous "it" this allows you to pass /... parts to a subhandler
        it("allows you to provide a prefix that will then be inserted before each generated url inside the handler.", function (expect) {
            var factory = moduleFactory();
            var RequestHandler = factory.createModule();
            var handler = new RequestHandler({
                "/foo": function foo() {
                    return this.urlFor["foo"]();
                }
            });
            handler.urlFor["foo"] = createSpy("urlFor", "/urlForResult");
            var generated = handler.handle({url: "/foo", method: "GET"}, undefined, undefined, {first:"prefix", rest: "/foo"});
            expect(generated).toEqual("prefix/urlForResult");
        });
        /*
            So you can say:

                var userHandler = new RequestHandler({
                    "/": function () {
                        // list all users
                    },
                    "/create": function () {
                        //return form html
                    },
                    "/create (POST)": function () {
                        // create a user with code such as this:
                        var user = this.database.addUser(formparser.handle(this.request));
                        return Redirect(user.id)
                    },
                    "/edit/{*}": function () {
                        //edit screen
                    },
                    "/edit/{*} (POST)": function () {
                        //edit screen
                    }
                });

                ... other file entirely ...
            
                var database = new database;
                new RequestHandler({
                    "/users/...": function (glob) {
                        return userHandler.handle(this.request, {database: database}, glob);
                    },
                    "/tickets/...": function (glob) {
                        return ticketHandler.handle(this.request, {database: database}, glob);
                    }
                });

            And now userHandler will be matched against the parts of the url after /users/, it will have access to
            this.translator and its result will be returned.
        
            We can now define a new module that wraps this handler and it won't know anything about it.
        */
    });

    category("Edge cases", function (it) {
        it("you can register a handler after creating the requestHandler", function (expect) {
            var factory = moduleFactory();
            var RequestHandler = factory.createModule();

            var shouldBeCalled = createSpy("");
            var handler = new RequestHandler();
            handler.addMatch("/foo/bar", shouldBeCalled);

            handler.handle({url: "/foo/bar", method: "GET"});
            expect(shouldBeCalled).toHaveBeenCalled();
        });
        it("you can't add an urlSpec that would match the same urls that an existing urlSpec matches", function (expect) {
            var factory = moduleFactory();
            var RequestHandler = factory.createModule();

            var handler = new RequestHandler({
                "/foo/bar": function () {}
            });

            expect(function () { handler.addMatch("/foo/{*}", function () {}); }).toThrow();
        });
        it("You can't add two handlers with the same name", function (expect) {
            var factory = moduleFactory();
            var RequestHandler = factory.createModule();

            expect(function () {
                new RequestHandler({
                    "/foo": function foo() {},
                    "/bar": function foo() {}
                });
            }).toThrow();
        });
        function edgeCase(text, func) {
            it(text, function (expect) {
                var factory = moduleFactory();
                var RequestHandler = factory.createModule();

                var shouldBeCalled = createSpy("");
                func(expect, RequestHandler, shouldBeCalled);
            });
        }
        
        edgeCase("match {*} in the middle of a matcher", function (expect, RequestHandler, shouldBeCalled) {
            var handler = new RequestHandler({
                "/foo/{*}/baz": shouldBeCalled
            });
            handler.handle({url: "/foo/bar/baz", method: "GET"});
            expect(shouldBeCalled).toHaveBeenCalledWith("bar", {});
        });

        edgeCase("match two {*}", function (expect, RequestHandler, shouldBeCalled) {
            var handler = new RequestHandler({
                "/foo/{*}/{*}": shouldBeCalled
            });
            handler.handle({url: "/foo/bar/baz", method: "GET"});
            expect(shouldBeCalled).toHaveBeenCalledWith("bar", "baz", {});
        });

        edgeCase("{*} only matches one segment at the end", function (expect, RequestHandler, shouldBeCalled) {
            var handler = new RequestHandler({
                "/foo/{*}/{*}": shouldBeCalled
            });
            handler.handle({url: "/foo/bar/baz/ban", method: "GET"});
            expect(shouldBeCalled).not.toHaveBeenCalled();
        });

        edgeCase("can handle both a {*} and a /...", function (expect, RequestHandler, shouldBeCalled) {
            var handler = new RequestHandler({
                "/foo/{*}/...": shouldBeCalled
            });
            handler.handle({url: "/foo/bar/baz", method: "GET"});
            expect(shouldBeCalled).toHaveBeenCalledWith("bar", {first: "/foo/bar", rest:"/baz"}, {});
        });

        edgeCase("rest is '/' when there is no rest", function (expect, RequestHandler, shouldBeCalled) {
            var handler = new RequestHandler({
                "/foo/...": shouldBeCalled
            });
            handler.handle({url: "/foo", method: "GET"});
            expect(shouldBeCalled).toHaveBeenCalledWith({first: "/foo", rest:"/"}, {});
        });

        edgeCase("won't call handler if the pattern is longer than the url", function (expect, RequestHandler, shouldBeCalled) {
            var handler = new RequestHandler({
                "/foo/bar": shouldBeCalled
            });
            handler.handle({url: "/foo", method: "GET"});
            expect(shouldBeCalled).not.toHaveBeenCalled();
        });

        edgeCase("will generate urls with two {*}'s", function (expect, RequestHandler, shouldBeCalled) {
            var handler = new RequestHandler({
                "/foo/{*}/{*}": function foo(){}
            });
            expect(handler.urlFor["foo"](1,2)).toEqual("/foo/1/2");

        });

        edgeCase("can specify a lonely '/' as matcher", function (expect, RequestHandler, shouldBeCalled) {
            var handler = new RequestHandler({
                "/": shouldBeCalled
            });
            handler.handle({url: "/", method: "GET"});
            expect(shouldBeCalled).toHaveBeenCalled();
        });
    });

    category("Bugfixes", function (it) {
        //bugs
        it("will be able to generate urls for handlers that are added through addMatch", function (expect) {
            var factory = moduleFactory();
            var RequestHandler = factory.createModule();

            var handler = new RequestHandler();
            handler.addMatch("/foo", function foo(){});
            expect(handler.urlFor["foo"]()).toEqual("/foo");
        });
    });
});
---
---
function RequestHandler(optContext, mappings) {
    var self = this;
    var requestedContextArgs;
    self.matchers = {};
    self.urlFor = {};
    if (mappings) {
        requestedContextArgs = optContext;
    } else {
        requestedContextArgs = [];
        mappings = optContext;
    }
    objLoop(mappings, function (urlSpec, callback) { self.addMatch(requestedContextArgs, urlSpec, callback); });
}

function patternMatches(pattern, incomingUrl) {
    var matchedVariablesForThisHandler = [];
    pattern += "/"; //the matcher will match an url without trailing slash if the pattern has a trailing slash
    //and patterns never end in a slash
    var patternSegments = pattern.split("/");
    var thisPatternMatches = true;
    var i;
    var urlSegment;
    var incomingUrlSegments = incomingUrl.split("/");
    for (i = 0; i < incomingUrlSegments.length; i += 1) {
        urlSegment = incomingUrlSegments[i];
        if (patternSegments[i] === "{*}") {
            matchedVariablesForThisHandler.push(urlSegment);
        } else if (patternSegments[i] === "...") {
            break;
        } else if (patternSegments[i] !== urlSegment) {
            thisPatternMatches = false;
        }
    }
    if (patternSegments[i]) {
        if (patternSegments[i] !== "...") {
            thisPatternMatches = false;
        } else {
            matchedVariablesForThisHandler.push({
                first: incomingUrlSegments.slice(0, i).join("/"),
                rest: incomingUrlSegments[i] ? "/" + incomingUrlSegments.slice(i).join("/") : "/"
            });
        }
    }
    return {
        variables: thisPatternMatches ? matchedVariablesForThisHandler : [],
        patternMatches: thisPatternMatches
    };
}

RequestHandler.prototype.handle = function (request, response, contextObject, glob) {
    var matchers = this.matchers;
    var urlToHandle = request.url;
    var prefix = "";

    if (glob) {
        prefix = glob.first;
        urlToHandle = glob.rest;
    }
    if (!contextObject) {
        contextObject = {};
    }
    var incomingUrl = urlTools.parse(urlToHandle, true);
    var matchedHandler;
    var matchedVariables = [];
    objLoop(matchers[request.method], function (matchPattern, handlerFunction) {
        var matchResult = patternMatches(matchPattern, incomingUrl.pathname);
        if (matchResult.patternMatches) {
            matchedHandler = handlerFunction;
            matchedVariables = matchResult.variables;
        }
    });
    if (matchedHandler) {
        var contextArgs = matchedHandler.requestedContextArgs.map(function (a) { return contextObject[a]; });
        return matchedHandler.handler.apply(
            {
                urlFor: objLoop(this.urlFor, function (key, value) {
                    return function () {
                        return prefix + value.apply(this, arguments);
                    };
                }),
                request: request,
                response: response
            },
            matchedVariables.concat([incomingUrl.query]).concat(contextArgs)
        );
    }
};

function specIsAllowed(urlSpec, currentSpecs) {
    var errors = [];
    //check that there is no /foo-{*}/bar but only /{*}/bar
    if (urlSpec.match("([^/]{.}[^/]|[^/]{.}$)")) {
        errors.push("'{*}' matches the whole part between the slashes, you can't specify a subpart");
    }
    //check that ... is only at the end
    if (urlSpec.match("\\.\\.\\..")) {
        errors.push("'...' can only be placed at the end of the url, because it matches the whole remaining portion");
    }
    if (urlSpec.match("(^\\./|/\\./|/\\.$|^\\.\\./|/\\.\\./|/\\.\\.$)")) {
        errors.push("relative path specifications (./ or ../) will not work.");
    }
    if (urlSpec.match("./$")) {
        errors.push("Path specs may not end in a slash (to ensure consistency). the spec /foo will also match /foo/");
    }
    if (!urlSpec.match("^/")) {
        errors.push("Path specs must start with a slash (to ensure consistency)");
    }
    //check for ambiguous matches
    var specParts = urlSpec.split("/");
    // /foo/bar and /foo/{*} both match /foo/bar. that is not allowed because that means that depending on the order
    // of the matches a different result will appear. That makes the code more complex and I haven't found it 
    // necessary. You can always do complex matching by matching using ... and interpreting the remainder of the url
    // yourself.
    var matches = currentSpecs.filter(function (other) {
        other = other.split("/");
        if (other.length !== specParts.length) {
            return false;
        } else {
            var matchingElements = specParts.filter(function (part, index) {
                return part === "{*}" || other[index] === part;
            });
            return matchingElements.length === other.length;
        }
    });
    if (matches.length > 0) {
        errors.push("Ambiguous match with: '" + matches.join("', '") + "'.");
    }
    return errors;
}

function handlerIsAllowed(handler, existingHandlers) {
    var errors = [];
    if (existingHandlers.indexOf(handler.name) > -1) {
        errors.push("Duplicate handler name '" + handler.name + "' is not allowed because this means one of the handlers can't be reached in urlFor.");
    }
    return errors;
}

RequestHandler.prototype.addMatch = function (requestedContextArgs, urlSpec, handler) {
    var matchers = this.matchers;

    var method;
    var methodAndUrlSpec = urlSpec.match(/(.*) \(([A-Z]+)\)$/);
    if (methodAndUrlSpec) {
        urlSpec = methodAndUrlSpec[1];
        method = methodAndUrlSpec[2];
    } else {
        method = "GET";
    }
    if (!matchers[method]) {
        matchers[method] = {};
    }
    var errors = specIsAllowed(urlSpec, Object.keys(matchers[method]));
    errors = errors.concat(handlerIsAllowed(handler, Object.keys(this.urlFor)));
    if (errors.length > 0) {
        //this is bad enough to make the program crash because it should only happen during startup and the 
        //programmer _must_ to be aware of this.
        throw new Error(errors.join("; "));
    }
    matchers[method][urlSpec] = {
        requestedContextArgs: requestedContextArgs,
        handler: handler
    }

    this.urlFor[handler.name] = function () {
        var argPos = -1;
        var args = arguments;
        return urlSpec.
            split("/").
            map(function (part) {
                if (part === "{*}") {
                    argPos += 1;
                    if (args.length <= argPos) {
                        throw new Error("This url requires more arguments");
                    }
                    return args[argPos];
                } else if (part === "...") {
                    argPos += 1;
                    if (args[argPos].substr(0,1) !== "/") {
                        throw new Error("The path to fill in the /... part must start with a '/'.");
                    }
                    return args[argPos].substr(1);
                } else {
                    return part;
                }
            }).
            join("/");
    };
};

return RequestHandler;