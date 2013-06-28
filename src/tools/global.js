---
description: Provides access to the global object across platforms
---
---
---
/*jshint evil:true*/

// To be cross compatible across different js platforms you need a way to access the global object (i.e. the window
// object in the browser). This can usually be achieved by returning "this" from a function that is not called as a 
// method. 

// Strict mode, however, throws an error when you do this. Calling the Function constructor with eval-able code gets 
// around this because that code is then automatically somewhat outside "use strict".

// yes this is obscure and hackish, hence the long explanation and the jshint pragma.
return new Function("return this")();