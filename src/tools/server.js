---
description: a very basic http.server implementation with handleRequest ability. No fancy streaming responses possible.
dependencies:
    RequestHandler: tools/requestHandler
    http: tools/node-wrappers/http
    test: richard/test
expects:
    console: http://developer.mozilla.org/en-US/docs/DOM/console.log
---
test(__module.AMDid, function (it) {
    //basic integration test
    it("works", function (expect, done) {
        var fakeRequestHandler = function () {
            return {
                handle: function (prefix, request, response, context) {
                    if (request.method === "GET") {
                        expect(context.requestData).not.toBeDefined();
                    } else {
                        expect(context.requestData).toEqual('some data with fancy characters é\n');
                    }
                    context.sendResults("some other data with fancy characters é");
                }
            };
        };
        var Webserver = __module.constructor(fakeRequestHandler, http);
        var server = new Webserver();
        server.start(8086);//just some port that isn't used often
        //request that has content
        var req = http.request({port: 8086, method: "POST"}, function (res) {
            var response = "";
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                response += chunk;
            });
            res.on('end', function (chunk) {
                expect(response).toEqual("some other data with fancy characters é");
                //request that has no content
                var newReq = http.request({port: 8086, method: "GET"}, function (res) {
                    var response = "";
                    res.setEncoding('utf8');
                    res.on('data', function (chunk) {
                        response += chunk;
                    });
                    res.on('end', function (chunk) {
                        expect(response).toEqual("some other data with fancy characters é");
                        server.stop();
                        done.fulfill();
                    });
                });
                newReq.end();
            });
        });
        req.end('some data with fancy characters é\n', "utf8");

        return done;
    });
});
---
---
function Webserver() {
    var requestHandler = new RequestHandler();
    this._requestHandler = requestHandler;
    this._httpServer = http.createServer(function (request, response) {
        //a request has content if it's content-length or it's encoding is set (if you want to send data without 
        //specifying a length then "transfer-encoding" must have the value "chunked")
        if (request.headers["content-length"] || request.headers["transfer-encoding"]) {
            var requestData = "";
            request.setEncoding("utf8");//the results are encoded as utf8 as well so formdata is posted as utf8
            request.on('data', function (block) {
                requestData += block;
            });
            request.on('end', function () {
                requestHandler.handle(
                    request,
                    response,
                    {
                        requestData: requestData, 
                        sendResults: function (result) {
                            response.end(result, "utf8");
                        }
                    }
                );
            });
        } else {
            requestHandler.handle(
                request, 
                response,
                {
                    sendResults: function (result) {
                        response.end(result, "utf8");
                    }
                }
            );
        }
    });
}

Webserver.prototype.start = function(port, hostname) {
    var self = this;
    self._httpServer.listen(port, hostname);
    self.port = port;
    self.hostname = hostname || "localhost";
};

Webserver.prototype.stop = function(port, hostname) {
    var self = this;
    self._httpServer.close();
    delete self.port;
    delete self.hostname;
};

Webserver.prototype.addMatch = function(requestedContext, matcher, handler) {
    this._requestHandler.addMatch(requestedContext, matcher, handler);
};

//handle changing tokens for posts (CSRF)
//don't send plain json in GET
return Webserver;