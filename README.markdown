#Jester

**TL;DR**: a javascript testing system with a specific view on what to test and how to test it. To see how it works: run `./node ./main.js` from the console, edit a javascript file in the ./src folder and save it in your editor. Watch the automatic testing goodness unfold.

![](./img/a-cloudy-day-for-onefte.png)

#Todo:
 * source maps end up at the wrong url '.' (setting breakpoints does work though)
 * error stacks aren't sourcemapped by themselves apparently. 
     - https://www.npmjs.org/package/stack-mapper
     - https://github.com/evanw/node-source-map-support
 * user interaction and GUI rendering tests through appthwack and Calabash.
 * rewire support (should be just a plugin away)
 * write new README.