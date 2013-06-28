#Jester

**TL;DR**: a javascript testing system with a specific view on what to test and how to test it. To see how it works: run `./node ./main.js` from the console, edit a javascript file in the ./src folder and save it in your editor. Watch the automatic testing goodness unfold.

![](./img/a-cloudy-day-for-onefte.png)

##You have one problem
You are a developer and you have a problem: You want to be able to write maintainable code.

Every time you write code it starts to degrade over time. Each time you make a change or upgrade a dependency you
introduce subtle bugs and spend the next few weeks fixing them one by one. Bugs might be system crashes, or more subtle
side effects where a function is behaving differently than before in a part of the code that you didn't immediately
expect.

After thinking about it for a while you realise that a system crash is really just a very in-your-face version of "a
function is behaving differently than before in a part of the code that you didn't immediately expect". 

After thinking about it some more you realise that a each change causes you to make many more changes, like ripples in a
pond that get wider and finally die out. So if your change wouldn't have "bugs" in the first place you would be able to
develop exponentially faster, not just linearly. You therefore define a "bug" from now on as anything where you either
made a wrong assumption about what the code should do (because you misunderstood the problem or your client) or where
you didn't tackle all edge cases.

Ah! this large looming problem has become much more concrete: You want to write code that does not behave unexpectedly.

To do this, you only need to be able to understand and predict all of the behaviour of the code while writing it!

Ah, but that means that you need to be able to open a random code unit and then be able to understand all of the
behaviour and side effects of that part of the code without having a mental model of the full application ...

...and you need to be able to understand all the assumptions that were made about this unit while writing the rest of
the codebase!

##You've heard of a solution
You've heard some people say that Test Driven Design will make this happen. So you start writing tests

    it("reacts to message 'foo' with result 'bar'", function () {/*test code*/});
    it("reacts to message 'foo' with result 'baz' if property 'zab' is set to true", function () {/*test code*/});
    it("has a property 'zab'", function () {/*test code*/});

You write a whole bunch of those. And you add some Mocks, Spies and Stubs as well. Awesome!

##Now you have five problems

After a while you realise you have a few new problems:

 1. Oftentimes you want to change some code code, which would make a test fail, so you change the test. Because the test
    asserts old behaviour and the change in behaviour is exactly what you want. However, sometimes other code was in 
    fact depending on the old behaviour and you get a runtime error.
 2. Come to think of it: what should you test? At what level? Should you test if a property exists? should you test if a
    certain function is called?
 3. You're writing your modules using require() calls or using AMD. Dependency injection is just a big PITA
 4. You write javascript so the browser is a big dependency. Each browser implements a different set of functionality. 
    Add node.js to the mix and you can't even trust on the existence of some global variables. This means that most of 
    your unittests become semi-integration tests; a succeeding test on a specific platform gives no guarantees for the 
    other platforms.
 5. You have to run the full test suite each time you make a change, (and because of point 4 you have to do it on all 
    browsers). This takes a long time and makes you postpone running the tests.
 
You probably have some more problems, but I'm only going to try and fix these five :)

##So that's why I wrote Jester

Jester was written by me in order to solve these problems. Really, I am just trying to solve problem 1 in the list
above. Jester is written to solve all the problems that arise from my solutions to that problem.

###1. Safely changing tests
Problem 1 is mainly the problem of [semantic coupling](http://c2.com/cgi/wiki?CouplingAndCohesion). When you change a
module, you want it to behave differently, but you're not aware who depends on the old behaviour. There are a few
possible solution strategies to this problem. The first: Writing a unittests, is really a way to assert that your module
will always behave this way and that this behaviour will never change. Maybe I'm just not experienced enough to write
the correct code, but I often *want* to  change the behaviour of some modules later on. Another solution strategy is
trying to avoid coupling as much as possible. While a good strategy in general, if overapplied this results in
enterprisey code that's overly generic and complex because each layer of indirection makes your code more complex, 
without adding any end-user value.

My preferred strategy is to make the coupling explicit. So if I change behaviour I can decide whether to update the
depending code as well or to introduce two code paths, one for the old behaviour and one for the new behaviour. I
learned this strategy from the [book](http://www.amazon.com/Growing-Object-Oriented-Software-Guided-Tests/dp/0321503627)
by Freeman and Pryce, and from the [excelent talk](http://www.infoq.com/presentations/integration-tests-scam) by JB
Rainsberger. You should really hear the talk and then read the book, but the TL;DR; version is that you find a way to
write a contract about how the module will behave. Freeman, Pryce and Rainsberger use Mocks as a form of executable
contract. If you change a piece of code you then simply check whether your new code is still compatible with the Mock
code. So if there is a mock that returns an Array with zero items, then there should be a code path in your code that
returns an Array with zero items.

This gets complicated when an object returns the result of another object. Say you have a Proxy object, what is it going
to return from the Mock? [Statically typed, type safe](http://blogs.msdn.com/b/ericlippert/archive/2012/10/15/is-c-a-strongly-typed-or-a-weakly-typed-language.aspx) languages will help you with this problem by forcing you to make a lot of contracts like this very explicit. 
Javascript isn't statically typed and therefore Jester includes a way to write contracts that allow you to 
somewhat statically verify your assumptions.

for example:

    Square:
        "()" num:
            num <- "*" num

You should read this as: The contract Square has one message "()" that expects an argument num. Values that you provide
as num should be able to handle the "\*" message and should be able to handle whatever requirements their "*" message
imposes on the first argument.

As you can see messages are defined using strings. Any string will do, there's no behaviour associated with certain
string forms. Using "()" to indicate a function call is purely my convention. The parameter `num` is another contract
that is sent to Square. `<-` is used to send a message. So to trigger this test you need to send `"()"` to the Square
contract.

    Number:
        "<is number>":
        "*" num:
            num <- "<is number>"

    MakeSquare:
        "()":
            Square <- "()" Number

But this will only work when you send `"()"` to MakeSquare! how do you start it all? By defining side-effects. In your
code this is usually a method that is triggered in the require() function

    triggerModule:
        side-effects:
            MakeSquare <- "()"

###2. What should I test

So what's in your test methods? Kent Beck style TDD adherents say that you should write the simplest code possible to
make a  test pass. So If you're writing a `Square(x)` method, your first test will `expect(Square(2)).toEqual(4)` and
your code will simply `return 4`. Then you write more tests until the need to remove code duplication forces you to stop
adding special cases and turn the code into `return x*x;`. While this method is very useful, it has the potential to
leave you with chronological tests; tests that aren't a declaration of what the code is like, but show a path to get to
the desired code.

While I sometimes do the hardcore TDD dance (and usually do a softer version where I skip a few steps). I do some test
refactoring afterwards so that I end up with three types of tests:

 1. The tests that specify the contract.
 2. The tests that "drive the design".
 3. Tests that test edge cases.

The first category is the tests that are written using the contract module described above.

The second category is created by looking at the module code that was written using a TDD or free form method and then
answering the question: "Why is this module here? ". Each piece of code should have a distinct reason for being in your
codebase. It fulfills a role. I write this down as a set of statements, and then reform those statements into to format
`it <verb>s <something or other>`. A nice algorithm is going past all logic in the code (if branches and loops) and to
determine what would happend if they where removed. Often answering these questions results in the code being split into
more modules that have a more definite "reason for being".

Each line should be about an action that that code is doing itself. Code often calls to an outside function. Sometimes
the call is a real action of this code, but often the outside function is doing the work and this code is just the place
where you hook that function into your execution path. If that is the case, the call shouldn't get its own test.

Each unittest that you write here should correspond to a message or a message check in the contract test.

Needing tests in the third category might be a bit of a code smell. You need to perform edge case tests if you have
complex logic (if branches nested three levels deep or more) or if the range of input variables is huge. Often you can
split up your code into multiple modules so that the logic is less complex and tell the callers that you're making more
assumptions about the arguments they provide. However, sometimes your code implements the domain logic and the
complexity is unavoidable.

###3. How can I perform dependency injection?
An AMD module is really a constructor function:

    define(
        ["dependency"],
        function AMDConstructor(dep) {
            //normal js code
        }
    )

So we're so close! yet so far, because the require.js authors specifically don't want their method to be used for DI.
However, if you don't do crazy UMD stuff it's fairly easy to extract the constructor function from an AMD module and 
jester does just that for you.

I haven't yet written the code to pair each amd module with an accompanying .test.js module because I took a shortcut (I
wanted to fix the interesting problems first :) So if you write your code in a wrapper like so:

    ---
    dependencies:
        dep: dependency
    ---
    // test code
    ---
    ... contract dsl as described earlier ...
    ---
    //normal js code

You get an object called __module in the test code that you can retrieve the AMD id from and using
`__module.constructor(myFakeDependency)` you can perform DI. Given an object with dependencies, testCode text and
moduleCode text Jester's bob module can generate test modules or production modules depending on what you need. So if 
you can somehow generate such an object from a collection of files and a naming convention you're all set. To register
your own loader you can add it to igor/delegatedModuleLoader

###3. How do I prevent running the full test suite each time I make a change?
igor/watchDirAndRunTasks provides a tool that watches the directories with your javascript files for changes and 
automatically builds a testfile that includes the testCode and all dependencies and starts a testRunner to run that test.
So upon pressing 'save':

 * Jshint will be run on the file
 * the file's unittests will be run
 * the conistency of all contracts will be checked

As a bonus: if your code contains the text `debugger;` somewhere, then testrunner will try and run it in debug mode. For
the node runner, this means that you can start a browser on http://127.0.0.1:8080/debug?port=5858 to step through your
code. You need to press run to get to your breakpoint.

##So what does it look like?

 * **Igor** is the main watcher process. Whenever a file changes it kicks off all other modules in the right order.
 * **Larry** can load various types of javascript modules into a normalized format
 * **Bob** contains the methods to generate various module formats from the in memory AMDModule format as loaded by
   Larry
 * **Douglas** is a small wrapper around jshint that makes jshint return it's results in the same format as the other
   modules.
 * **Bertrand** contains a parser for the contract declarations and a checker that calls all necessary checks
 * **Tess** is a test runner framework. It is able to execute a javascript file ~~on multiple platforms~~ and report the 
   results to the caller. Only the the node runner is included ATM
 * **Richard** is a very basic unittest framework with a built-in "expect" assertion handler and a basic spy 
   constructor.

There's also the **tools** folder which contains some generic javascript utilities (such as map and filter) that have no
domain specific logic. As soon as enough similar modules end up in "tools", they get split out into their own folder.