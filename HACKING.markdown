# How to debug Jester

### Debug jester with node-inspector

1. Start node-inspector on port 8080:

    	.\dist\node_modules\.bin\node-inspector --web-port=8080
   		info  - socket.io started
		visit http://0.0.0.0:8080/debug?port=5858 to start debugging
     

2. Start jester in debug mode:
     
        $ .\dist\node.exe --debug-brk .\dist\jester.js
     	debugger listening on port 5858

### Debug Jester's unittests

1. Run jester: 

    	.\dist\node.exe .\dist\jester.js

2. Add a breakpoint in a unittest by inserting the string `breakpoint;` somewhere and save the file.

3. Browse to http://localhost:8080

	


